// src/core/utils/helpers.ts
export function generateOTP(length = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min)).toString();
}

export function calculateExpiry(minutes = 5): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
}

export async function sendOtpEmail(
  email: string,
  otp: string,
): Promise<boolean> {
  try {
    const subject = 'Your OTP Code';
    const text = `Your OTP code is ${otp}. It is valid for 5 minutes.`;
    const html = `<p>Your OTP code is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`;
    await this.mailerService.sendMail(email, subject, text, html);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false; // Fallback to indicate email failure
  }
}
