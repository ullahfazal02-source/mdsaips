import sendEmail from './sendEmail.js';

/**
 * Send OTP Verification Email to User
 * Formats HTML email template without exposing OTP in logs.
 */
export const sendOTPEmail = async (toEmail, userName, otpCode) => {
  const subject = 'Your MDSAIPS Verification Code';
  const nameDisplay = userName || 'User';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { font-size: 22px; font-weight: 800; color: #38bdf8; letter-spacing: 1px; }
          .title { font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 8px; }
          .content { font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 24px; }
          .otp-card { background: #090d16; border: 1px solid #38bdf8; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; }
          .footer { font-size: 12px; color: #64748b; text-align: center; border-t: 1px solid #334155; padding-top: 16px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">MDSAIPS PLATFORM</div>
            <div class="title">Email Verification</div>
          </div>
          <div class="content">
            <p>Hello <strong>${nameDisplay}</strong>,</p>
            <p>Your MDSAIPS verification code is:</p>
            <div class="otp-card">
              <span class="otp-code">${otpCode}</span>
            </div>
            <p>This code is valid for <strong>10 minutes</strong>.</p>
            <p>For security, do not share this code with anyone.</p>
            <p>If you did not request this code, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            Regards,<br>
            <strong>MDSAIPS Team</strong>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `Hello ${nameDisplay},\n\nYour MDSAIPS verification code is: ${otpCode}\n\nThis code is valid for 10 minutes.\nFor security, do not share this code with anyone.\nIf you did not request this code, you can safely ignore this email.\n\nRegards,\nMDSAIPS Team`;

  return await sendEmail({
    to: toEmail,
    subject,
    html,
    text,
  });
};

export default sendOTPEmail;
