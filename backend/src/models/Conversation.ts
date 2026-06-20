import mongoose from "mongoose";

const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    participants: {
        type: [String],
        required: true,
        validate: {
            validator: (arr: string[]) => arr.length === 2,
            message: "A conversation must have exactly 2 participants",
        },
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})

conversationSchema.index({ participants: 1 });

export default mongoose.model("Conversation", conversationSchema);
