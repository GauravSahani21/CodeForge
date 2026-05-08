import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (to: string, otp: string, username: string): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your CodeForge Password</title>
      <style>
        body { margin: 0; padding: 0; background-color: #0d1117; font-family: 'Segoe UI', sans-serif; }
        .container { max-width: 520px; margin: 40px auto; background: #161b22; border-radius: 16px; overflow: hidden; border: 1px solid #30363d; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 32px; text-align: center; }
        .logo { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
        .logo span { color: #a78bfa; }
        .body { padding: 36px 32px; }
        .greeting { font-size: 16px; color: #e6edf3; margin-bottom: 8px; }
        .message { font-size: 14px; color: #8b949e; line-height: 1.6; margin-bottom: 28px; }
        .otp-box { background: #0d1117; border: 2px solid #7c3aed; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 28px 0; }
        .otp-label { font-size: 11px; color: #8b949e; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .otp-code { font-size: 42px; font-weight: 900; color: #a78bfa; letter-spacing: 10px; font-family: 'Courier New', monospace; }
        .expiry { font-size: 12px; color: #6e7681; text-align: center; margin-bottom: 28px; }
        .expiry strong { color: #f0883e; }
        .warning { background: #1c1c2e; border-left: 3px solid #f0883e; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #8b949e; line-height: 1.5; }
        .footer { padding: 20px 32px; background: #0d1117; text-align: center; font-size: 11px; color: #484f58; border-top: 1px solid #21262d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Code<span>Forge</span> ⚡</div>
        </div>
        <div class="body">
          <div class="greeting">Hi <strong style="color:#e6edf3">${username}</strong> 👋</div>
          <div class="message">
            We received a request to reset your CodeForge password. Use the OTP below to proceed.
            If you didn't request this, you can safely ignore this email.
          </div>
          <div class="otp-box">
            <div class="otp-label">Your One-Time Password</div>
            <div class="otp-code">${otp}</div>
          </div>
          <div class="expiry">This OTP expires in <strong>10 minutes</strong>.</div>
          <div class="warning">
            🔒 <strong style="color:#e6edf3">Security tip:</strong> Never share this OTP with anyone.
            CodeForge staff will never ask for your OTP.
          </div>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} CodeForge. Happy Coding! 🚀
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"CodeForge ⚡" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${otp} is your CodeForge password reset OTP`,
    html,
  });
};
