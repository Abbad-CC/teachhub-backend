import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,     // your Gmail
    pass: process.env.EMAIL_PASS,     // app password (not regular password!)
  },
});

export const sendBulkEmail = async (
  recipients: string[],
  subject: string,
  text: string,
  senderName: string,
  senderEmail: string
) => {
  const mailOptions = {
    from: `"${senderName} (TeachHub)" <${process.env.EMAIL_USER}>`,
    to: recipients,
    subject,
    text,
    replyTo: senderEmail,
  };

  return transporter.sendMail(mailOptions);
};
