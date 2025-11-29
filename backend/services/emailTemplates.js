import { emailConfig } from '../config/email.js';

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shukuma Fitness</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #000000;
      font-size: 32px;
      font-weight: 800;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #fbbf24;
      color: #000000;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #f59e0b;
    }
    .footer {
      background-color: #f3f4f6;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div style="padding: 20px;">
    <div class="container">
      <div class="header">
        <h1>Shukuma</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Shukuma Fitness. All rights reserved.</p>
        <p>You're receiving this email because you have an account with us.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const welcomeEmail = (name) => {
  const content = `
    <h2>Welcome to Shukuma! 🎉</h2>
    <p>Hi ${name},</p>
    <p>We're thrilled to have you join our fitness community! You're now part of a platform dedicated to helping you achieve your fitness goals without any equipment.</p>
    <div class="divider"></div>
    <h3>Get Started:</h3>
    <ul style="line-height: 2;">
      <li>Check out your personalized dashboard</li>
      <li>Browse our exercise library</li>
      <li>Join a community challenge</li>
      <li>Start your fitness journal</li>
    </ul>
    <div style="text-align: center;">
      <a href="${emailConfig.frontendUrl}/dashboard" class="button">Go to Dashboard</a>
    </div>
    <div class="divider"></div>
    <p>Need help getting started? Check out our <a href="${emailConfig.frontendUrl}/help" style="color: #f59e0b;">help center</a>.</p>
    <p>Let's make fitness happen!</p>
  `;
  return baseTemplate(content);
};

export const passwordResetEmail = (name, resetToken) => {
  const resetUrl = `${emailConfig.frontendUrl}/reset-password?token=${resetToken}`;

  const content = `
    <h2>Reset Your Password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    <div class="divider"></div>
    <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
    <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    <div class="divider"></div>
    <p style="font-size: 12px; color: #6b7280;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #f59e0b; word-break: break-all;">${resetUrl}</a>
    </p>
  `;
  return baseTemplate(content);
};

export const challengeJoinedEmail = (name, challengeTitle) => {
  const content = `
    <h2>Challenge Accepted!</h2>
    <p>Hi ${name},</p>
    <p>Great news! You've successfully joined the <strong>${challengeTitle}</strong> challenge.</p>
    <div class="divider"></div>
    <p>Stay committed and track your progress daily</p>
    <p>Compete with other participants on the leaderboard</p>
    <p>Push yourself to reach your goals</p>
    <div style="text-align: center;">
      <a href="${emailConfig.frontendUrl}/challenges" class="button">View Challenge</a>
    </div>
    <div class="divider"></div>
    <p>Remember: consistency is key! Good luck! 🚀</p>
  `;
  return baseTemplate(content);
};

export const workoutMilestoneEmail = (name, milestone) => {
  const content = `
    <h2>Milestone Achieved! 🏆</h2>
    <p>Hi ${name},</p>
    <p>Congratulations! You've just reached an incredible milestone:</p>
    <div style="text-align: center; padding: 20px; background-color: #fef3c7; border-radius: 8px; margin: 20px 0;">
      <h1 style="color: #f59e0b; margin: 0; font-size: 48px;">${milestone}</h1>
      <p style="color: #92400e; margin: 10px 0 0 0; font-weight: 600;">Workouts Completed</p>
    </div>
    <p>Your dedication and consistency are truly inspiring! Keep up the amazing work!</p>
    <div style="text-align: center;">
      <a href="${emailConfig.frontendUrl}/progress" class="button">View Your Progress</a>
    </div>
  `;
  return baseTemplate(content);
};
