// Vercel Serverless Function: Real Email OTP Dispatch Service
// Supports Resend API, Brevo API, and SMTP relay.

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, name } = req.body || {};
  const trimmedEmail = (email || '').trim().toLowerCase();

  if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
  const recipientName = (name || 'Valued Customer').trim();

  let emailDelivered = false;
  let deliveryMethod = 'none';
  let deliveryError = null;

  // 1. Try Resend API if configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM || 'ASK Transport <onboarding@resend.dev>';
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [trimmedEmail],
          subject: `${generatedOtp} is your ASK Transport verification code`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #0284c7; margin-top: 0;">ASK TRANSPORT</h2>
              <p>Hello <strong>${recipientName}</strong>,</p>
              <p>Your one-time verification code for ASK Transport account registration is:</p>
              <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #166534; font-family: monospace;">${generatedOtp}</span>
              </div>
              <p style="color: #64748b; font-size: 13px;">This code is valid for 10 minutes. For security reasons, please do not share this OTP with anyone.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 11px; margin-bottom: 0;">ASK Transport Group &bull; Logistics & Supply Chain Fleet Management</p>
            </div>
          `
        })
      });

      if (resp.ok) {
        emailDelivered = true;
        deliveryMethod = 'resend';
      } else {
        const errJson = await resp.json().catch(() => ({}));
        deliveryError = errJson.message || `Resend HTTP ${resp.status}`;
      }
    } catch (err) {
      deliveryError = err.message;
    }
  }

  // 2. Try Brevo API if configured and not delivered yet
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!emailDelivered && brevoApiKey) {
    try {
      const fromEmail = process.env.BREVO_FROM || 'support@asktransport.in';
      const fromName = process.env.BREVO_FROM_NAME || 'ASK Transport';
      const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': brevoApiKey
        },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: trimmedEmail, name: recipientName }],
          subject: `${generatedOtp} is your ASK Transport verification code`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #0284c7; margin-top: 0;">ASK TRANSPORT</h2>
              <p>Hello <strong>${recipientName}</strong>,</p>
              <p>Your one-time verification code for ASK Transport account registration is:</p>
              <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #166534; font-family: monospace;">${generatedOtp}</span>
              </div>
              <p style="color: #64748b; font-size: 13px;">This code is valid for 10 minutes. For security reasons, please do not share this OTP with anyone.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 11px; margin-bottom: 0;">ASK Transport Group &bull; Logistics & Supply Chain Fleet Management</p>
            </div>
          `
        })
      });

      if (resp.ok) {
        emailDelivered = true;
        deliveryMethod = 'brevo';
      } else {
        const errJson = await resp.json().catch(() => ({}));
        deliveryError = errJson.message || `Brevo HTTP ${resp.status}`;
      }
    } catch (err) {
      deliveryError = err.message;
    }
  }

  // 3. Fallback: SMTP Relay via nodemailer if available
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!emailDelivered && smtpUser && smtpPass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'ASK Transport'}" <${process.env.SMTP_FROM || smtpUser}>`,
        to: trimmedEmail,
        subject: `${generatedOtp} is your ASK Transport verification code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <h2 style="color: #0284c7; margin-top: 0;">ASK TRANSPORT</h2>
            <p>Hello <strong>${recipientName}</strong>,</p>
            <p>Your one-time verification code for ASK Transport account registration is:</p>
            <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #166534; font-family: monospace;">${generatedOtp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px;">This code is valid for 10 minutes. For security reasons, please do not share this OTP with anyone.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 11px; margin-bottom: 0;">ASK Transport Group &bull; Logistics & Supply Chain Fleet Management</p>
          </div>
        `
      });

      emailDelivered = true;
      deliveryMethod = 'smtp';
    } catch (err) {
      deliveryError = err.message;
    }
  }

  return res.status(200).json({
    success: true,
    emailDelivered,
    deliveryMethod,
    deliveryError,
    otp: generatedOtp,
    email: trimmedEmail,
    message: emailDelivered
      ? `Verification OTP sent successfully to ${trimmedEmail}!`
      : `Email dispatch service pending configuration in Vercel environment variables.`
  });
}
