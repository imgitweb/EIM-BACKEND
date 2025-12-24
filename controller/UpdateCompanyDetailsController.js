const CompanyDetails = require('../models/CompanyDetails');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/company_documents/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and images allowed'), false);
    }
  }
});

const checkOwnership = async (req, res, next) => {
  try {
    const companyDetails = await CompanyDetails.findById(req.params.id);
    if (!companyDetails) {
      return res.status(404).json({ error: 'Company details not found' });
    }
    if (companyDetails.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    req.companyDetails = companyDetails;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getCompanyDetails = async (req, res) => {
  try {
    const companyDetails = await CompanyDetails.findById(req.params.id).populate('userId', 'name email');
    if (!companyDetails) {
      return res.status(404).json({ error: 'Company details not found' });
    }
    // If auth middleware is bypassed in development, `req.user` may be undefined.
    // Only enforce ownership when `req.user` is present.
    if (req.user && companyDetails.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.json(companyDetails);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCompanyDetails = [
  upload.fields([
    { name: 'gstDocument', maxCount: 1 },
    { name: 'panDocument', maxCount: 1 }
  ]),
  async (req, res) => {
    // Debug: log incoming request summary to help inspect FormData and files
    console.log('UpdateCompanyDetails request:', {
      params: req.params,
      hasAuthorizationHeader: !!(req.headers && req.headers.authorization),
      bodyKeys: req.body ? Object.keys(req.body) : [],
      filesKeys: req.files ? Object.keys(req.files) : []
    });

    try {
      const { id } = req.params;
      const updates = req.body;

      const requiredFields = ['companyName', 'email', 'hasRegistration'];
      const missingFields = requiredFields.filter(field => !updates[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      if (req.files.gstDocument) {
        updates.gstDocument = req.files.gstDocument[0].path;
      }
      if (req.files.panDocument) {
        updates.panDocument = req.files.panDocument[0].path;
      }

      if (updates.hasRegistration === 'No') {
        updates.industry = '';
        updates.employees = '';
        updates.registrationType = '';
        updates.gstNumber = '';
        updates.panNumber = '';
        updates.gstDocument = '';
        updates.panDocument = '';
      }

      // Sanitize updates to avoid passing invalid values to Mongoose (e.g. userId as object/string)
      const sanitizedUpdates = {};
      const problematicKeys = [];
      Object.keys(updates).forEach((key) => {
        let val = updates[key];
        // If value looks like a JSON string, try to parse it
        if (typeof val === 'string' && val.trim().startsWith('{') && val.trim().endsWith('}')) {
          try {
            val = JSON.parse(val);
          } catch (e) {
            // leave as string if parse fails
          }
        }

        // If the frontend accidentally sent an object which became the string '[object Object]', clear it
        if (val === '[object Object]') {
          problematicKeys.push(key);
          val = '';
        }

        // Prevent clients from changing ownership via userId in the payload
        if (key === 'userId') {
          // skip including userId in update; ownership is determined from auth
          return;
        }

        // For safety, convert empty object to empty string
        if (typeof val === 'object' && val !== null) {
          // If this is an object with an _id or id, try to extract it
          if (val._id || val.id) {
            const candidate = val._id || val.id;
            if (mongoose.Types.ObjectId.isValid(candidate)) {
              sanitizedUpdates[key] = candidate;
              return;
            }
          }
          problematicKeys.push(key);
          sanitizedUpdates[key] = '';
          return;
        }

        sanitizedUpdates[key] = val;
      });

      if (problematicKeys.length > 0) {
        console.warn('Sanitized problematic update keys:', problematicKeys);
      }

      let companyDetails = await CompanyDetails.findByIdAndUpdate(
        id,
        { $set: sanitizedUpdates },
        { new: true, runValidators: true }
      ).populate('userId', 'name email');

      if (!companyDetails) {
        // If record doesn't exist, attempt to create it instead of returning 404.
        // Determine owner: prefer authenticated user, fall back to provided userId in updates.
        let ownerId = req.user ? req.user.id : updates.userId;
        if (!ownerId) {
          return res.status(400).json({ error: 'Company details not found and no userId available to create record' });
        }

        // If ownerId is an object (e.g. { _id: ... } or { id: ... }), extract the id string
        if (typeof ownerId === 'object') {
          ownerId = ownerId._id || ownerId.id || (ownerId.toString && ownerId.toString());
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
          return res.status(400).json({ error: 'Invalid userId provided' });
        }

        const createData = { ...updates, userId: ownerId };
        try {
          const created = await CompanyDetails.create({ _id: id, ...createData });
          // populate userId for consistency
          const populated = await CompanyDetails.findById(created._id).populate('userId', 'name email');
          // assign to companyDetails for downstream ownership check and response
          companyDetails = populated;
        } catch (createErr) {
          console.error('Error creating CompanyDetails:', createErr);
          return res.status(500).json({ error: createErr.message || 'Error creating company details' });
        }
      }
      // Only enforce ownership when `req.user` exists (i.e. auth middleware ran).
      if (req.user && companyDetails.userId._id.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      res.json({
        message: 'Company details updated successfully',
        data: companyDetails
      });
    } catch (error) {
      console.error('UpdateCompanyDetails error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }
];