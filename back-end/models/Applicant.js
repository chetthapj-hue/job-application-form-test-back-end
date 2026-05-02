const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  firstName: { type: String, required: [true, 'First name is required'], trim: true },
  lastName: { type: String, required: [true, 'Last name is required'], trim: true },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  phone: { type: String, required: [true, 'Phone number is required'], trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Reviewing', 'Interviewing', 'Accepted', 'Rejected'], 
    default: 'Pending' 
  },
  resume: { type: String }, 
  transcript: { type: String }, 
  applicationForm: { type: String },
  experienceYears: { type: Number, default: 0 },
  skills: [{ type: String }],
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Applicant', applicantSchema);
