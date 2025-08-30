// Import Node built-in modules using ESM
import path from "path";
import fs from "fs/promises"; // fs.promises equivalent
import { fileURLToPath } from "url";

// Import your models using ESM import
import Course from "../../models/courses/Course.js";
import Module from "../../models/courses/Module.js";
import Video from "../../models/courses/Video.js";

export const createCourse = async (req, res) => {
  try {
    const {
      title,
      category,
      subcategory,
      description,
      language,
      rating,
      level,
      milestone,
      tags,
    } = req.body;

    console.log("Creating course:", req.body);

    // Validate required fields
    if (!title || !category || !description) {
      return res.status(400).json({
        error: "Missing required fields: title, category, description",
      });
    }

    const thumbnail = req.file ? req.file.filename : null;

    // ✅ Safely normalize tags
    let tagsArray = [];
    if (typeof tags === "string") {
      tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
    } else if (Array.isArray(tags)) {
      tagsArray = tags.map((tag) => String(tag).trim()).filter((tag) => tag);
    }

    const course = new Course({
      title,
      category,
      subcategory,
      description,
      language,
      rating: rating || 0,
      milestone,
      level,
      thumbnail,
      tags: tagsArray,
      objectives: [], // Optional: Fill later
      prerequisites: [], // Optional
    });

    const savedCourse = await course.save();
    res.status(201).json({ message: "Course created", course: savedCourse });
  } catch (err) {
    console.error("Error saving course:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
  const page = parseInt(req.query.page) || 1;       // Default to page 1
    const limit = parseInt(req.query.limit) || 10;    // Default to 10 items per page
    const skip = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        error:
          "Invalid pagination parameters. Page must be >= 1, limit must be 1-100",
      });
    }

    

    const courses = await Course.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments();

    // Don't return 404 for empty results, return empty array instead
    if (!courses || courses.length === 0) {
      return res.status(404).json({ error: 'No courses found' });
    }


    res.json({
      data: courses,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      hasMore: skip + courses.length < total,
      hasMore: skip + courses.length < total
    });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getFullCourseByID = async (req, res) => {
  try {
    const courseId = req.params.id;
    console.log("Fetching full course details for ID:", courseId);

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    // Fetch course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Fetch modules for the course - sort by order instead of createdAt for proper sequencing
    const modules = await Module.find({ course: courseId }).sort({
      order: 1,
    });

    // Return course even if no modules exist
    if (!modules || modules.length === 0) {
      return res.json({
        course,
        modules: [],
      });
    }

    const moduleIds = modules.map((mod) => mod._id);

    // Fetch all videos and group them by module
    const videosByModule = await Video.aggregate([
      { $match: { module: { $in: moduleIds } } },
      {
        $group: {
          _id: "$module",
          videos: {
            $push: {
              _id: "$_id",
              title: "$title",
              type: "$type",
              videoUrl: "$videoUrl",
              vimeoId: "$vimeoId",
              videoFile: "$videoFile",
              transcript: "$transcript",
              generateAssessment: "$generateAssessment",
              duration: "$duration",
              createdAt: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Create a map for module -> videos
    const videoMap = {};
    videosByModule.forEach((entry) => {
      videoMap[entry._id.toString()] = {
        videos: entry.videos,
        videoCount: entry.count,
      };
    });

    // Build module array with video details
    const modulesWithVideos = modules.map((mod) => {
      const videoData = videoMap[mod._id.toString()] || {
        videos: [],
        videoCount: 0,
      };
      return {
        ...mod.toObject(),
        videoCount: videoData.videoCount,
        videos: videoData.videos,
      };
    });

    res.json({
      course,
      modules: modulesWithVideos,
    });
  } catch (err) {
    console.error("Error fetching full course:", err);
    res.status(500).json({ error: "Server error" });
  }
};

 export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      subcategory,
      description,
      language,
      rating,
      level,
      milestone,
      tags,
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    // Check if course exists
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Safely handle tags
    let tagsArray = [];
    if (tags) {
      if (typeof tags === "string") {
        tagsArray = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      } else if (Array.isArray(tags)) {
        tagsArray = tags.map((tag) => String(tag).trim()).filter((tag) => tag);
      }
    }

    const updateData = {
      title: title || existingCourse.title,
      category: category || existingCourse.category,
      subcategory: subcategory || existingCourse.subcategory,
      description: description || existingCourse.description,
      language: language || existingCourse.language,
      rating: rating !== undefined ? rating : existingCourse.rating,
      level: level || existingCourse.level,
      milestone: milestone || existingCourse.milestone,
      tags: tags ? tagsArray : existingCourse.tags,
    };

    // Handle file upload
    if (req.file) {
      // Delete old thumbnail if it exists
      if (existingCourse.thumbnail) {
        const oldThumbnailPath = path.join("uploads", existingCourse.thumbnail);
        try {
          if (fsSync.existsSync(oldThumbnailPath)) {
            fsSync.unlinkSync(oldThumbnailPath);
          }
        } catch (fileError) {
          console.warn("Could not delete old thumbnail:", fileError.message);
        }
      }
      updateData.thumbnail = req.file.filename;
    }

    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ message: "Course updated", course: updatedCourse });
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ error: "Server error" });
  }
};

 export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Delete associated modules and videos
    const modules = await Module.find({ course: id });
    const moduleIds = modules.map((mod) => mod._id);

    if (moduleIds.length > 0) {
      await Video.deleteMany({ module: { $in: moduleIds } });
      await Module.deleteMany({ course: id });
    }

    // Delete the course
    await Course.findByIdAndDelete(id);

    // Delete thumbnail file if it exists
    if (course.thumbnail) {
      const thumbnailPath = path.join("uploads", course.thumbnail);
      try {
        if (fsSync.existsSync(thumbnailPath)) {
          fsSync.unlinkSync(thumbnailPath);
        }
      } catch (fileError) {
        console.warn("Could not delete thumbnail file:", fileError.message);
      }
    }

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ error: "Server error" });
  }
};

