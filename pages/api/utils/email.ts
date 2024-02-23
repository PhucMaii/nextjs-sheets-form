import { transporter } from './transporter';

const emailHandler = async (
  email: string,
  subject: string,
  title: string,
  template: string,
) => {
  try {
    await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: subject,
      text: title,
      html: template,
    });
  } catch (error) {
    console.log('Fail to send email, ', error);
  }
};

export default emailHandler;
