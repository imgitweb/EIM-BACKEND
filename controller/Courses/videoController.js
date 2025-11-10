const Video = require("../../models/courses/Video.js");
const Course = require("../../models/courses/Course.js");
const Module = require("../../models/courses/Module.js");
const { uploadToVimeo } = require("../../utils/vimeoUploader.js");
const fs = require("fs").promises;
const fsSync = require("fs");
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const Quiz = require("../../models/courses/Quiz.js");

// Helper function to safely delete files
const safeDeleteFile = async (filePath) => {
  try {
    if (fsSync.existsSync(filePath)) {
      await fs.unlink(filePath);
      console.log(`✅ File deleted: ${filePath}`);
    }
  } catch (error) {
    console.error(`❗ Error deleting file ${filePath}:`, error.message);
  }
};

// Placeholder for Vimeo transcript fetch - implement based on Vimeo API
const fetchTranscriptFromVimeo = async (vimeoId) => {
  // TODO: Implement actual Vimeo API call
  console.log(`Fetching transcript for Vimeo ID: ${vimeoId}`);
  return null; // Return actual transcript data when implemented
};

const uploadVideo = async (req, res) => {
  let uploadedFilePath = null;

  try {
    const {
      courseId,
      moduleId,
      title,
      type,
      videoUrl,
      transcript,
      generateAssessment,
    } = req.body;

    // Validate required fields
    if (!courseId || !moduleId || !title || !type) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Validate that course and module exist
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const module = await Module.findById(moduleId);
    if (!module) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    // Validate that module belongs to course
    if (module.course.toString() !== courseId) {
      return res.status(400).json({
        success: false,
        message: "Module does not belong to the specified course",
      });
    }

    let finalVideoUrl = videoUrl || null;
    let vimeoId = null;
    let videoFile = null;

    // Handle different video types
    if (type === "upload") {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No video file uploaded" });
      }

      uploadedFilePath = req.file.path;
      videoFile = req.file.filename;

      try {
        // Upload file to Vimeo
        vimeoId = await uploadToVimeo(req.file.path, title);
        finalVideoUrl = `https://player.vimeo.com/video/${vimeoId}`;
        console.log(`✅ Video uploaded to Vimeo: ${vimeoId}`);
      } catch (err) {
        console.error("❌ Vimeo Upload Failed:", err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to upload to Vimeo" });
      } finally {
        // Clean up local file after upload attempt
        if (uploadedFilePath) {
          await safeDeleteFile(uploadedFilePath);
        }
      }
    } else if (type === "youtube" || type === "external") {
      // Validate URL for external videos
      if (!videoUrl) {
        return res.status(400).json({
          success: false,
          message: "Video URL is required for external videos",
        });
      }
      finalVideoUrl = videoUrl;
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Invalid video type. Must be 'upload', 'youtube', or 'external'",
      });
    }

    // Create video document
    const newVideo = new Video({
      course: courseId,
      module: moduleId,
      title: title.trim(),
      type,
      videoUrl: finalVideoUrl,
      vimeoId,
      videoFile,
      transcript: transcript ? transcript.trim() : null,
      generateAssessment: !!generateAssessment,
      duration: "-", // TODO: Calculate actual duration
    });

    const savedVideo = await newVideo.save();

     if (generateAssessment) {
      try {
        console.log("🧠 Generating quiz using ChatGPT...");

        const prompt = `
        Generate 5 high-quality multiple-choice quiz questions based on this video title:
        "${title}"
        ${transcript ? `Transcript content: ${transcript.slice(0, 2000)}` : ""}
        
        Each question must include:
        - "question": string
        - "options": array of 4 options
        - "answer": correct option index (0-3)
        - "explanation": short one-line explanation.
        Return as valid JSON array.
        `;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
        });

        const textResponse = completion.choices[0].message.content.trim();

        let parsedQuestions;
        try {
          parsedQuestions = JSON.parse(textResponse);
        } catch (err) {
          console.error("⚠️ JSON Parse Error:", err);
          parsedQuestions = [];
        }

        if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
          console.warn("⚠️ No quiz generated from ChatGPT.");
        } else {
          const quiz = new Quiz({
            video: savedVideo._id,
            questions: parsedQuestions,
          });

          const savedQuiz = await quiz.save();
          console.log("✅ Quiz generated and saved:", savedQuiz._id);
        }
      } catch (quizErr) {
        console.error("❌ Quiz generation failed:", quizErr);
      }
    }












    return res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      data: savedVideo,
    });
  } catch (error) {
    console.error("🔥 Upload Error:", error);

    // Clean up file if upload failed
    if (uploadedFilePath) {
      await safeDeleteFile(uploadedFilePath);
    }

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getVimeoTranscript = async (req, res) => {
  try {
    const { vimeoId } = req.params;

    if (!vimeoId) {
      return res
        .status(400)
        .json({ success: false, message: "Vimeo ID is required" });
    }

    // Fetch transcript from Vimeo
    const transcript = await fetchTranscriptFromVimeo(vimeoId);

    if (!transcript) {
      return res.status(404).json({
        success: false,
        message: "Transcript not found or not ready yet",
      });
    }

    return res.json({
      success: true,
      data: { transcript },
    });
  } catch (err) {
    console.error("Error fetching Vimeo transcript:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching transcript" });
  }
};

const saveTranscript = async (req, res) => {
  try {
    const { id, transcript, transcriptionMethod } = req.body;

    if (!id || !transcript) {
      return res.status(400).json({
        success: false,
        message: "Video ID and transcript are required",
      });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    video.transcript = transcript.trim();
    video.transcriptionMethod = transcriptionMethod || "manual";
    video.updatedAt = new Date();

    await video.save();

    res.json({
      success: true,
      message: "Transcript saved successfully",
      data: {
        transcript: video.transcript,
        transcriptionMethod: video.transcriptionMethod,
      },
    });
  } catch (err) {
    console.error("Error saving transcript:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to save transcript" });
  }
};

const getVideosByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    if (!moduleId) {
      return res
        .status(400)
        .json({ success: false, message: "Module ID is required" });
    }

    // Verify module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    const videos = await Video.find({ module: moduleId })
      .sort({ createdAt: 1 }) // Changed to ascending for proper order
      .select("-__v"); // Exclude version field

    res.json({
      success: true,
      data: videos,
      count: videos.length,
    });
  } catch (error) {
    console.error("Fetch Videos Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching videos",
    });
  }
};

const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, videoUrl, transcript, generateAssessment } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Video ID is required" });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    // Validate video type change
    if (type && !["upload", "youtube", "external"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid video type" });
    }

    // Update fields only if provided
    if (title) video.title = title.trim();
    if (type) video.type = type;

    // Handle URL updates based on type
    if (videoUrl) {
      if (
        type === "youtube" ||
        type === "external" ||
        video.type === "youtube" ||
        video.type === "external"
      ) {
        video.videoUrl = videoUrl;
      }
    }

    if (transcript !== undefined) {
      video.transcript = transcript ? transcript.trim() : null;
    }

    if (generateAssessment !== undefined) {
      video.generateAssessment = !!generateAssessment;
    }

    video.updatedAt = new Date();
    const updatedVideo = await video.save();

    res.json({
      success: true,
      message: "Video updated successfully",
      data: updatedVideo,
    });
  } catch (error) {
    console.error("Update Video Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Video ID is required" });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    // TODO: Add Vimeo video deletion if vimeoId exists
    if (video.vimeoId) {
      console.log(`TODO: Delete Vimeo video with ID: ${video.vimeoId}`);
      // Implement Vimeo deletion: await deleteFromVimeo(video.vimeoId);
    }

    // Delete local video file if exists
    if (video.videoFile) {
      const videoPath = `uploads/videos/${video.videoFile}`;
      await safeDeleteFile(videoPath);
    }

    await Video.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Delete Video Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  uploadVideo,
  getVimeoTranscript,
  saveTranscript,
  getVideosByModule,
  updateVideo,
  deleteVideo,
};
