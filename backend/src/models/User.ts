import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})


export default mongoose.model("User", userSchema);
