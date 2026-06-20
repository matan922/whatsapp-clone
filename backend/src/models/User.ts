import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "",
    },
    phoneNumber: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


export default mongoose.model("User", userSchema);
