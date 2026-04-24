const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host:"smtp.gmail.com",
  port:465,
  secure:true,
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});
module.exports= sendEmail=async(mailOptions)=>{
    console.log(process.env.GMAIL_USERNAME,process.env.GMAIL_PASSWORD)
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
         console.log(info.response)
        }
      });
    };