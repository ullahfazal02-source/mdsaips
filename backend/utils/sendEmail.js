import nodemailer from 'nodemailer';
import logger from './logger.js';

/**
 * Reusable Send Email utility using Nodemailer
 * Uses environment variables for SMTP credentials.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.FROM_EMAIL || '"MDSAIPS Core System" <noreply@mdsaips.com>';

  // Development check: if SMTP is missing, log warning and fail gracefully without crashing
  if (!host || !user || !pass) {
    logger.warn('SMTP is not configured. OTP email cannot be delivered.');
    return {
      success: false,
      error: 'SMTP is not configured',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    logger.info(`Email delivered successfully to [${to}] MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to deliver email to [${to}]: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export default sendEmail;
