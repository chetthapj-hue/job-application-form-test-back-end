require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Department = require('./models/Department');
const Admin = require('./models/Admin');
const Applicant = require('./models/Applicant');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Department.deleteMany({});
    await Admin.deleteMany({});
    await Applicant.deleteMany({}); // Optional: clear applicants too for a fresh start
    console.log('Cleared existing data.');

    // Seed Departments
    const departments = [
      { name: 'IT', description: 'Information Technology and Software Development' },
      { name: 'HR', description: 'Human Resources and Talent Management' },
      { name: 'Marketing', description: 'Digital Marketing and Brand Strategy' },
      { name: 'Sales', description: 'Sales and Business Development' },
      { name: 'Finance', description: 'Financial Planning and Accounting' }
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log('Sample departments seeded.');

    // Seed Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin1234', salt);

    const admin = new Admin({
      email: 'admin@example.com',
      password: hashedPassword
    });

    await admin.save();
    console.log('Admin user seeded (admin@example.com / admin1234).');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
