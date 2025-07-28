import Video from '../../models/courses/Video.js';
import Course from '../../models/courses/Course.js';
import Module from '../../models/courses/Module.js';

export const uploadVideo = async (req, res) => {
  try {
    const {
      courseId,
      moduleId,
      title,
      type,
      videoUrl, // optional for uploaded files
      transcript,
      generateAssessment,
    } = req.body;

    if (!courseId || !moduleId || !title || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ error: 'Module not found' });

    const newVideo = new Video({
      course: courseId,
      module: moduleId,
      title,
      type,
      videoUrl: type === 'youtube' ? videoUrl : null,
      transcript,
      generateAssessment,
      duration: '-', // could be auto-calculated later
    });

    const savedVideo = await newVideo.save();

    return res.status(201).json({ message: 'Video uploaded successfully', video: savedVideo });
  } catch (error) {
    console.error('Upload Video Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
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
