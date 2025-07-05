import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();


async function startDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database is connected');
  } catch (error) {
    console.log('Mongoose error', error);
    throw error;
  }
}

export default startDB;
