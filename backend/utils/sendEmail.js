// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  const host = process.env.EMAIL_HOST || 'smtp.zoho.in';
  const port = parseInt(process.env.EMAIL_PORT, 10) || 465;
  const secure = process.env.EMAIL_SECURE !== 'false';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const fromName = process.env.EMAIL_FROM_NAME || 'gyaanlms';

  if (!user || !pass) {
    console.warn('EMAIL_USER or EMAIL_PASS is not configured.');
    throw new Error('Email service is not configured');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: `"${fromName}" <${user}>`,
    to,
    subject,
    html,
    text: text || (html ? html.replace(/<[^>]*>/g, '') : ''),
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent successfully via Zoho Mail:', info.messageId);
  return info;
};

module.exports = sendEmail;