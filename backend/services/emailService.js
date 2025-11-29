import { transporter, emailConfig } from '../config/email.js';
import {
  welcomeEmail,
  passwordResetEmail,
  challengeJoinedEmail,
  workoutMilestoneEmail,
} from './emailTemplates.js';
import logger from '../utils/logger.js';

const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    logger.warn(`Email skipped (no transporter): ${subject} to ${to}`);
    return { skipped: true };
  }

  try {
    const mailOptions = {
      from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.success(`Email sent: ${subject} to ${to}`);
    return info;
  } catch (error) {
    logger.error(`Email failed: ${subject} to ${to}`, { error: error.message });
    throw error;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to Shukuma!';
  const html = welcomeEmail(name);
  return sendEmail(email, subject, html);
};

export const sendPasswordResetEmail = async (email, name, resetToken) => {
  const subject = 'Reset Your Shukuma Password 🔒';
  const html = passwordResetEmail(name, resetToken);
  return sendEmail(email, subject, html);
};

export const sendChallengeJoinedEmail = async (email, name, challengeTitle) => {
  const subject = `You Joined: ${challengeTitle} `;
  const html = challengeJoinedEmail(name, challengeTitle);
  return sendEmail(email, subject, html);
};

export const sendWorkoutMilestoneEmail = async (email, name, milestone) => {
  const subject = `Milestone Achieved: ${milestone} Workouts! `;
  const html = workoutMilestoneEmail(name, milestone);
  return sendEmail(email, subject, html);
};
