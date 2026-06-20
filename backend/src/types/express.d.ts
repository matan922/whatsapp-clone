import { Document } from "mongoose";

declare global {
    namespace Express {
        interface Request {
            user?: Document & {
                _id: unknown;
                clerkId: string;
                displayName: string;
                avatar: string;
                phoneNumber: string | null;
                createdAt: Date;
            };
        }
    }
}
