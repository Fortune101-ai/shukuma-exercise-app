import nodemailer from "nodemailer"
import logger from "../utils/logger.js"

const createTransporter = () => {

  const config = {
    host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  }

  if (process.env.NODE_ENV === "development" && !process.env.EMAIL_USER) {
    logger.warn("No email credentials found. Email features disabled.")
    logger.info("To enable emails, add EMAIL_USER and EMAIL_PASSWORD to .env")
    return null
  }

  try {
    const transporter = nodemailer.createTransporter(config)

    transporter.verify((error) => {
      if (error) {
        logger.error("Email service connection failed:", error.message)
      } else {
        logger.success("Email service ready")
      }
    })

    return transporter
  } catch (error) {
    logger.error("Failed to create email transporter:", error.message)
    return null
  }
}

export const transporter = createTransporter()

export const emailConfig = {
  from: {
    name: process.env.EMAIL_FROM_NAME || "Shukuma Fitness",
    email: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  },
  frontendUrl: process.env.FRONTEND_URL
}