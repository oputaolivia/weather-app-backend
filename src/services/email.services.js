import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL,
    pass: process.env.MAIL_PASS,
  },
});

export const sendMail = async (mailOptions)=>{
  try {
    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return error
      } else {
        console.log("Email sent: " + info.response);
        return info.response
      }
    });
  } catch (error) {
    
  }
}

const selectTemplate = (template) =>{
    let source = "";
  switch (template) {
    case "welcome":
      source = fs.readFileSync(path.join(__dirname,"./templates/welcome.handlebars"), "utf8");
      break;
  }
  return Handlebars.compile(source);
}

export const dispatchMail = async (userEmail, subject, payload, template) => {
    try {
      const compiledTemplate = selectTemplate(template)
      let mailOptions = {
        from: process.env.MAIL,
        to: userEmail,
        subject: subject,
        html: compiledTemplate(payload),
      };
      await sendMail(mailOptions);
    } catch (err) {
      return err;
    }
  };