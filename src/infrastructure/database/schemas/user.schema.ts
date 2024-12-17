import { Schema } from 'mongoose';

export const UserSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }, // Add the phone field
    passwordHash: { type: String, required: true }, 
    otp: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
    isProfileCompleted:{type:Boolean,default:false},
    age: { type: Number },
    goal: { type: String },
    height: { type: Number },
    weight: { type: Number },
    gender: { type: String },
    refreshToken:{type:String}
});
