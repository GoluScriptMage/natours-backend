/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require('nodemailer');

exports.sendEmail = async (options) => {
  // 1) Create the Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Create the email options
  const mailOptions = {
    from: 'Natours <natours.gmail.io/>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Send the email
  await transporter.sendMail(mailOptions);
};
