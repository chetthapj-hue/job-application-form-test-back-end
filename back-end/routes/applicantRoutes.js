const express = require('express');
const router = express.Router();
const Applicant = require('../models/Applicant');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    // Double check directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File Filter for Validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const applicantUpload = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'transcript', maxCount: 1 }
]);

// Create Applicant (Public)
router.post('/', (req, res) => {
  applicantUpload(req, res, async (err) => {
    // Handle Multer specific errors
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('General Upload Error:', err);
      return res.status(400).json({ message: err.message });
    }

    try {
      const { firstName, lastName, email, phone, department, position } = req.body;

      // Basic Validation
      if (!firstName || !lastName || !email || !department) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
      }

      // Check if files exist
      if (!req.files || !req.files['resume']) {
        return res.status(400).json({ message: 'Resume is required.' });
      }

      const applicantData = {
        firstName,
        lastName,
        email,
        phone,
        department,
        position,
        resume: req.files['resume'][0].filename, // Store only the filename
        transcript: req.files['transcript'] ? req.files['transcript'][0].filename : null,
        status: 'Pending'
      };

      const applicant = new Applicant(applicantData);
      await applicant.save();
      
      console.log('Applicant saved successfully:', applicant._id);
      res.status(201).json({ message: 'Application submitted successfully!', id: applicant._id });
    } catch (error) {
      console.error('Database Error:', error);
      res.status(500).json({ message: 'Server error while saving application.' });
    }
  });
});

// Get all applicants (Protected)
router.get('/', auth, async (req, res) => {
  try {
    const { department, status } = req.query;
    let query = {};
    if (department && department !== 'All') query.department = department;
    if (status && status !== 'All') query.status = status;

    const applicants = await Applicant.find(query).populate('department');
    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get stats (Protected)
router.get('/stats', auth, async (req, res) => {
  try {
    const total = await Applicant.countDocuments();
    const stats = await Applicant.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({ total, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update status (Protected)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { new: true }
    );
    res.json(applicant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get single applicant (Protected)
router.get('/:id', auth, async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id).populate('department');
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
    res.json(applicant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
