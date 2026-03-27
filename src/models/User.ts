import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  projectId: string;
}

const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  projectId: { type: String, required: true }
});

export default mongoose.model<IUser>("User", UserSchema);

