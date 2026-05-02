const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      const admin = new Admin({
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin' // Added role as requested
      });
      
      await admin.save();
      console.log('✅ Default admin user created: admin@example.com / 123456');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  }
};

module.exports = seedAdmin;
