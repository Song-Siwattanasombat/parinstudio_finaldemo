import nodemailer from 'nodemailer';

const hasEmailConfig = () =>
  process.env.EMAIL_HOST &&
  process.env.EMAIL_PORT &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_FROM;

const sendEmail = async ({ to, subject, text, html }) => {
  if (!hasEmailConfig()) {
    console.log(`Email not sent. Missing SMTP config. To: ${to}. Subject: ${subject}.`);
    console.log(text);
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return { skipped: false };
};

export { hasEmailConfig };
export default sendEmail;
