import mongoose from 'mongoose';
import colors from 'colors';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);

    const db = await mongoose.connect(process.env.MONGODB_URI);

    console.log(colors.blue.bold(`MongoDB Connected: ${db.connection.host}`));
    return db;
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
