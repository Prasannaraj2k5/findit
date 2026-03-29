import mongoose from 'mongoose';

let dbConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
    });
    dbConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    dbConnected = false;
    // In demo mode, continue without DB
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Running in demo mode without MongoDB');
    } else {
      process.exit(1);
    }
  }
};

export const isConnected = () => dbConnected;

export default connectDB;

