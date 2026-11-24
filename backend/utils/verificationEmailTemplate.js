// utils/verificationEmailTemplate.js
// Shared HTML for the email-verification mail so the 6-digit code and the
// verification link stay in sync between `register` and `resend-verification`.

const CODE_TTL_MINUTES = 10;
const LINK_TTL_HOURS = 24;

const buildVerificationEmail = ({ name, code, verifyUrl, isResend = false }) => {
  const heading = isResend ? 'Verify Your GyaanLMS Account' : 'Welcome to GyaanLMS!';
  const intro = isResend
    ? 'You requested a new verification code. Use the 6-digit code below to verify your email address and activate your account:'
    : 'Thank you for registering. Use the 6-digit code below to verify your email address and activate your account:';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #4F46E5; margin-bottom: 16px;">${heading}</h2>
      <p style="font-size: 15px; color: #374151;">Hi ${name},</p>
      <p style="font-size: 15px; color: #374151;">${intro}</p>
      <div style="margin: 24px 0; text-align: center;">
        <div style="display: inline-block; padding: 14px 28px; background-color: #EEF2FF; border: 2px dashed #4F46E5; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; font-family: 'Courier New', Courier, monospace;">${code}</div>
      </div>
      <p style="font-size: 13px; color: #6B7280; text-align: center;">Enter this code on the verification screen. It expires in ${CODE_TTL_MINUTES} minutes.</p>
      <p style="font-size: 15px; color: #374151;">Prefer one click? Verify instantly with the button below:</p>
      <div style="margin: 25px 0;">
        <a href="${verifyUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
      </div>
      <p style="font-size: 13px; color: #6B7280;">Or copy and paste this link in your browser:</p>
      <p style="font-size: 13px; color: #4F46E5; word-break: break-all;">${verifyUrl}</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9CA3AF;">The code expires in ${CODE_TTL_MINUTES} minutes and the link expires in ${LINK_TTL_HOURS} hours. If you did not create an account, please ignore this email.</p>
    </div>
  `;
};

module.exports = buildVerificationEmail;
module.exports.CODE_TTL_MINUTES = CODE_TTL_MINUTES;
module.exports.LINK_TTL_HOURS = LINK_TTL_HOURS;
