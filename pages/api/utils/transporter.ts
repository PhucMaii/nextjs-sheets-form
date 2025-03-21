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

// export const yahooTransporter = nodemailer.createTransport({
//   service: 'yahoo',
//   auth: {
//     user: email,
//     pass,
//   },
// });

const yahooEmail = process.env.YAHOO_EMAIL;

export const yahooTransporter = nodemailer.createTransport({
  host: 'smtp.mail.yahoo.com',
  port: 465,
  service: 'yahoo',
  secure: false,
  auth: {
    user: yahooEmail,
    pass: 'maithienphuc0102',
  },
});

export const hotmailTransporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.NODEMAILER_HOTMAIL,
    pass: process.env.NODEMAILER_HOTMAIL_PASS,
  },
});
