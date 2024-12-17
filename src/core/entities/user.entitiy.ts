export interface User {
    id?: string;
    username: string;
    email: string;
    passwordHash: string;
    phone: string; // Add this field to store phone number
    otp: string;
    otpExpiresAt: Date;
    isVerified: boolean;
    isProfileCompleted?:boolean;
    age?: number;
    goal?: string;
    height?: number;
    weight?: number;
    gender?: string;
    refreshToken?:string;
}
