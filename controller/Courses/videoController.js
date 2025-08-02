import Video from '../../models/courses/Video.js';
import Course from '../../models/courses/Course.js';
import Module from '../../models/courses/Module.js';
import { uploadToVimeo } from '../../utils/vimeoUploader.js';
import fs from 'fs';

// export const uploadVideo = async (req, res) => {
//   try {
//     const {
//       courseId,
//       moduleId,
//       title,
//       type,
//       videoUrl, // optional for uploaded files
//       transcript,
//       generateAssessment,
//     } = req.body;

//     if (!courseId || !moduleId || !title || !type) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const course = await Course.findById(courseId);
//     if (!course) return res.status(404).json({ error: 'Course not found' });

//     const module = await Module.findById(moduleId);
//     if (!module) return res.status(404).json({ error: 'Module not found' });

//     const newVideo = new Video({
//       course: courseId,
//       module: moduleId,
//       title,
//       type,
//       videoUrl: type === 'youtube' ? videoUrl : null,
//       transcript,
//       generateAssessment,
//       duration: '-', // could be auto-calculated later
//     });

//     const savedVideo = await newVideo.save();

//     return res.status(201).json({ message: 'Video uploaded successfully', video: savedVideo });
//   } catch (error) {
//     console.error('Upload Video Error:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };


export const uploadVideo = async (req, res) => {
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

    if (!courseId || !moduleId || !title || !type) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let finalVideoUrl = videoUrl || null;
    let vimeoId = null;

    // ▶ If file upload
    if (type === 'upload') {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No video file uploaded' });
      }

      try {
        // Upload file to Vimeo
        vimeoId = await uploadToVimeo(req.file.path, title);
        finalVideoUrl = `https://player.vimeo.com/video/${vimeoId}`;
      } catch (err) {
        console.error('❌ Vimeo Upload Failed:', err);
        return res.status(500).json({ success: false, message: 'Failed to upload to Vimeo' });
      } finally {
        // Delete local file after upload
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('❗ Error deleting file:', err);
        });
      }
    }

    // ▶ Save video in DB
    const newVideo = new Video({
      course: courseId,
      module: moduleId,
      title,
      type,
      videoUrl: finalVideoUrl,
      vimeoId,
      transcript,
      generateAssessment: !!generateAssessment,
      duration: '-', // Optional: enhance later
    });

    const savedVideo = await newVideo.save();

    return res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: savedVideo,
    });

  } catch (error) {
    console.error('🔥 Upload Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


export const getVimeoTranscript = async (req, res) => {
  const { vimeoId } = req.params;

  try {
    // Replace with actual Vimeo transcription fetch logic
    const transcript = await fetchTranscriptFromVimeo(vimeoId); // implement this
    if (!transcript) return res.status(404).json({ success: false, message: 'Transcript not found yet' });

    return res.json({
      success: true,
      data: { transcript },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error fetching transcript' });
  }
};

export const saveTranscript = async (req, res) => {
  const { id, transcript, transcriptionMethod } = req.body;
  try {
    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    video.transcript = transcript;
    video.transcriptionMethod = transcriptionMethod || 'manual';
    await video.save();

    res.json({ success: true, message: 'Transcript saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to save transcript' });
  }
};


export const getVideosByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const videos = await Video.find({ module: moduleId }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error('Fetch Videos Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, videoUrl, transcript, generateAssessment } = req.body;

    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    video.title = title || video.title;
    video.type = type || video.type;
    video.videoUrl = type === 'youtube' ? videoUrl
        : video.videoUrl; // Only update if type is youtube

    video.transcript = transcript || video.transcript;
    video.generateAssessment = generateAssessment || video.generateAssessment;

    const updatedVideo = await video.save();
    res.json({ message: 'Video updated successfully', video: updatedVideo });
  } catch (error) {
    console.error('Update Video Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByIdAndDelete(id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete Video Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

