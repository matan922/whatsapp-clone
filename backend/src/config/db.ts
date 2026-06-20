import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI!)
        console.log(`MongoDB Connected on port: ${connect.connection.port}`);

    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1); // stop server if DB fails
    }

}


