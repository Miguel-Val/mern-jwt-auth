import mongoose from "mongoose";
import { MONGO_URI } from "../constants/env";

const connectDB = async () => {
    try {
        console.log("Connecting to DB");
        await mongoose.connect(MONGO_URI);
        console.log("Successfully connected to MongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
        process.exit(1);
    }
};

export default connectDB;
