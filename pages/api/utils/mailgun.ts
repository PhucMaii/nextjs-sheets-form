import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  const data = {
    from: `Mailgun Sandbox <${process.env.MAILGUN_FROM_EMAIL}>`,
    to,
    subject,
    text,
  };

  try {
    const domain = process.env.MAILGUN_DOMAIN || '';

    const response = await mg.messages.create(domain, data);
    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
