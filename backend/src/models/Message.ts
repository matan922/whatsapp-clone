import mongoose from "mongoose";

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    senderId: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

messageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
