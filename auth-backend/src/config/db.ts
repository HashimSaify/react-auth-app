// src/config/db.ts

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables here as well,
// so MONGO_URI is available when this file runs.
dotenv.config();

// Read the MongoDB connection string from environment variables
const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined. Please set it in the .env file.');
}

// This function will connect our app to MongoDB
export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}
