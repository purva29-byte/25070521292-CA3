import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

let transporter;

export function isEmailConfigured() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.pass && env.smtp.from);
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

export async function sendPasswordResetEmail(user, rawToken) {
  if (!isEmailConfigured()) {
    throw new ApiError(503, 'Password-reset email is not configured on this server.', {
      code: 'EMAIL_NOT_CONFIGURED',
    });
  }

  const resetUrl = `${env.clientUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

  try {
    await getTransporter().sendMail({
      from: env.smtp.from,
      to: user.email,
      subject: 'Reset your UniMarket password',
      text: [
        `Hi ${user.name},`,
        '',
        'We received a request to reset your UniMarket password. This link is valid for 30 minutes and can only be used once:',
        resetUrl,
        '',
        'If you did not request this, you can safely ignore this email.',
        '',
        '— UniMarket',
      ].join('\n'),
      html: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#17201b;max-width:560px;margin:auto">
          <h2 style="font-weight:600">Reset your UniMarket password</h2>
          <p>Hi ${escapeHtml(user.name)},</p>
          <p>We received a request to reset your password. This link is valid for 30 minutes and can only be used once.</p>
          <p><a href="${resetUrl}" style="display:inline-block;background:#1f5a43;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none">Choose a new password</a></p>
          <p style="color:#66706a;font-size:14px">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    throw new ApiError(502, 'The reset email could not be sent. Please try again later.', {
      code: 'EMAIL_SEND_FAILED',
    });
  }
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
