const express = require('express');
const router = express.Router();
const Applicant = require('../models/Applicant');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create Applicant (Public)
router.post('/', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'transcript', maxCount: 1 },
  { name: 'applicationForm', maxCount: 1 }
]), async (req, res) => {
  try {
    const applicantData = {
      ...req.body,
      resume: req.files['resume'] ? req.files['resume'][0].path.replace(/\\/g, '/') : null,
      transcript: req.files['transcript'] ? req.files['transcript'][0].path.replace(/\\/g, '/') : null,
      applicationForm: req.files['applicationForm'] ? req.files['applicationForm'][0].path.replace(/\\/g, '/') : null
    };
    const applicant = new Applicant(applicantData);
    await applicant.save();
    res.status(201).json(applicant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
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
