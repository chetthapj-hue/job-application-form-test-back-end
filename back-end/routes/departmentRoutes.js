const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const auth = require('../middleware/auth');

// Create (Protected)
router.post('/', auth, async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all (Public - needed for application form)
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update (Protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
