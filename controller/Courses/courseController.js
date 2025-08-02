import path from 'path';
import fs from 'fs';
import Course from '../../models/courses/Course.js';
import Module from '../../models/courses/Module.js';
import Video from '../../models/courses/Video.js';

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

    console.log('Creating course:', req.body);

    const thumbnail = req.file ? req.file.filename : null;

    // ✅ Safely normalize tags
    let tagsArray = [];
    if (typeof tags === 'string') {
      tagsArray = tags.split(',').map(tag => tag.trim());
    } else if (Array.isArray(tags)) {
      tagsArray = tags.map(tag => String(tag).trim());
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
    res.status(201).json({ message: 'Course created', course: savedCourse });
  } catch (err) {
    console.error('Error saving course:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getFullCourseByID = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Fetch course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Fetch modules for the course
    const modules = await Module.find({ course: courseId }).sort({ createdAt: -1 });
    if (!modules || modules.length === 0) {
      return res.status(404).json({ error: 'No modules found for this course' });
    }

    const moduleIds = modules.map(mod => mod._id);

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
              createdAt: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a map for module -> videos
    const videoMap = {};
    videosByModule.forEach(entry => {
      videoMap[entry._id.toString()] = {
        videos: entry.videos,
        videoCount: entry.count
      };
    });

    // Build module array with video details
    const modulesWithVideos = modules.map(mod => {
      const videoData = videoMap[mod._id.toString()] || { videos: [], videoCount: 0 };
      return {
        ...mod.toObject(),
        videoCount: videoData.videoCount,
        videos: videoData.videos
      };
    });

    res.json({
      course,
      modules: modulesWithVideos
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
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
    
        const updateData = {
        title,
        category,
        subcategory,
        description,
        language,
        rating: rating || 0,
        level,
        milestone,
        tags: tags.split(',').map(tag => tag.trim()),
        };
    
        if (req.file) {
        const course = await Course.findById(id);
        if (course.thumbnail) {
            fs.unlinkSync(path.join('uploads', course.thumbnail));
        }
        updateData.thumbnail = req.file.filename;
        }
    
        const updatedCourse = await Course.findByIdAndUpdate(id, updateData, { new: true });
        res.json({ message: 'Course updated', course: updatedCourse });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
    };

export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
        return res.status(404).json({ error: 'Course not found' });
        }
        if (course.thumbnail) {
        fs.unlinkSync(path.join('uploads', course.thumbnail));
        }
        res.json({ message: 'Course deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};


