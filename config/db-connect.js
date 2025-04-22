import { connect } from 'mongoose';
import { configDotenv } from 'dotenv';

configDotenv();
const connectDB = async () => {
    try {
        await connect(process.env.DB_URI, {
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
};

export default connectDB;