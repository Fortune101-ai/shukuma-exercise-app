import mongoose from 'mongoose';

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected');

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDatabase;
