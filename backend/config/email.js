import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


export const emailConfig = {
  from: {
    name: process.env.EMAIL_FROM_NAME || "Shukuma Fitness",
    email: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  },
  frontendUrl: process.env.FRONTEND_URL
}