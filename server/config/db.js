import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

let dbConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
    });
    dbConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Seed admin user if not exists
    await seedAdmin();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    dbConnected = false;
    console.log('⚠️  Running in demo mode without MongoDB');
  }
};

async function seedAdmin() {
  try {
    // Dynamic import to avoid circular dependency
    const { default: User } = await import('../models/User.js');
    
    const adminEmail = 'admin@university.in';
    const existing = await User.findOne({ email: adminEmail });
    
    if (!existing) {
      await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        isVerified: true,
        reputation: {
          score: 150,
          level: 'champion',
          itemsReported: 12,
          itemsFound: 8,
          successfulReturns: 15,
        },
      });
      console.log('👑 Admin user seeded: admin@university.in / admin123');
    } else if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log('👑 Admin role restored for admin@university.in');
    } else {
      console.log('👑 Admin user already exists');
    }
  } catch (err) {
    console.error('⚠️  Failed to seed admin:', err.message);
  }
}


export const isConnected = () => dbConnected;

export default connectDB;

