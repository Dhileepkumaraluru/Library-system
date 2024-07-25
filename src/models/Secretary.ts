import mongoose, { Document, Schema } from 'mongoose';

export interface ISecretary extends Document {
    username: string;
    password: string;
    loginTime?: Date | null;
    workingHours?: number;
}

const SecretarySchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    loginTime: { type: Date, default: null },
    workingHours: { type: Number, default: 0 }
});


export default mongoose.model<ISecretary>('Secretary', SecretarySchema);
