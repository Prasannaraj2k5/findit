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
    console.log('⚠️  Running in demo mode without MongoDB');
  }
};

export const isConnected = () => dbConnected;

export default connectDB;

