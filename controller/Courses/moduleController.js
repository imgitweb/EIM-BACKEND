import Module from '../../models/courses/Module.js';
import Course from '../../models/courses/Course.js';

export const addModule = async (req, res) => {
  try {
    const { courseId, name, description } = req.body;

    if (!courseId || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const existingModules = await Module.find({ course: courseId });
    const order = existingModules.length + 1;

    const newModule = new Module({
      course: courseId,
      order,
      name,
      description,
    });

    const savedModule = await newModule.save();
    res.status(201).json({ message: 'Module created', module: savedModule });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const getModulesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const modules = await Module.find({ course: courseId }).sort({ order: 1 });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching modules' });
  }
};

export const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    module.name = name || module.name;
    module.description = description || module.description;
    const updatedModule = await module.save();
    res.json({ message: 'Module updated', module: updatedModule });
    }
    catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    const module = await Module.findByIdAndDelete(id);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

