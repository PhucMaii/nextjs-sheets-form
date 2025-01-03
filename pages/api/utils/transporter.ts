import nodemailer from 'nodemailer';

const email = process.env.NODEMAILER_EMAIL;
const pass = process.env.NODEMAILER_PASSWORD;

export const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass,
  },
});

export const yahooTransporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: email,
    pass,
  },
});
