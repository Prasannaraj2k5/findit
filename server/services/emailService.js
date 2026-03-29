import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  const transport = getTransporter();

  if (!transport) {
    console.log(`📧 [Demo Mode] Email to ${to}:`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${html.substring(0, 200)}...`);
    return { demo: true };
  }

  try {
    const info = await transport.sendMail({
      from: `"FindIt" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: 'Verify your FindIt account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Welcome to FindIt! 🎉</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">Verify Email</a>
        <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
      </div>
    `,
  });
};

export const sendMatchNotificationEmail = async (email, itemTitle, matchTitle) => {
  return sendEmail({
    to: email,
    subject: `FindIt: Potential match found for "${itemTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Match Found! 🔍</h2>
        <p>We found a potential match for your item <strong>"${itemTitle}"</strong>.</p>
        <p>Matched item: <strong>"${matchTitle}"</strong></p>
        <a href="${process.env.CLIENT_URL}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">View Match</a>
      </div>
    `,
  });
};
