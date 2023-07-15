const nodeMailer = require("nodemailer");

const sendEmail = async(options) =>{
     
     console.log(process.env.SMPT_MAIL,process.env.SMPT_PASSWORD);
     const trsansporter = nodeMailer.createTransport({
        service:process.env.SMTP_SERVICE,
        host:process.env.SMTP_HOST,
        port:process.env.SMTP_PORT,
        auth:{
            user:process.env.SMPT_MAIL,
            pass:process.env.SMPT_PASSWORD
        }
     })

     const mailOptions = {
        from: process.env.SMPT_MAIL,
        to:options.email,
        subject:options.subject,
        text:options.message
     };

     await trsansporter.sendMail(mailOptions);
};

module.exports = sendEmail;

