// Vercel Serverless Function: Real Email OTP Dispatch Service via Gmail TLS SMTP (Zero External Dependencies)
import tls from 'tls';

function sendSmtpEmail({ from, to, password, subject, htmlBody }) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(465, 'smtp.gmail.com', () => {});
    let step = 0;
    socket.setEncoding('utf8');

    const rawMessage = [
      `From: "ASK Transport" <${from}>`,
      `To: <${to}>`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      ``,
      htmlBody,
      `.`
    ].join('\r\n');

    socket.on('data', (data) => {
      if (data.startsWith('220') && step === 0) {
        step = 1;
        socket.write('EHLO localhost\r\n');
      } else if (data.startsWith('250') && step === 1) {
        step = 2;
        socket.write('AUTH LOGIN\r\n');
      } else if (data.startsWith('334') && step === 2) {
        step = 3;
        socket.write(Buffer.from(from).toString('base64') + '\r\n');
      } else if (data.startsWith('334') && step === 3) {
        step = 4;
        socket.write(Buffer.from(password.replace(/\s+/g, '')).toString('base64') + '\r\n');
      } else if (data.startsWith('235') && step === 4) {
        step = 5;
        socket.write(`MAIL FROM:<${from}>\r\n`);
      } else if (data.startsWith('250') && step === 5) {
        step = 6;
        socket.write(`RCPT TO:<${to}>\r\n`);
      } else if (data.startsWith('250') && step === 6) {
        step = 7;
        socket.write('DATA\r\n');
      } else if (data.startsWith('354') && step === 7) {
        step = 8;
        socket.write(rawMessage + '\r\n');
      } else if (data.startsWith('250') && step === 8) {
        socket.write('QUIT\r\n');
        resolve({ success: true });
      } else if (data.startsWith('535') || data.startsWith('550') || data.startsWith('501')) {
        resolve({ success: false, error: data.trim() });
      }
    });

    socket.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    setTimeout(() => {
      socket.destroy();
      resolve({ success: false, error: 'SMTP connection timeout' });
    }, 12000);
  });
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body || {};
  const email = (body.email || '').trim().toLowerCase();
  const name = (body.name || 'Valued Customer').trim();

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
  const senderEmail = process.env.SMTP_USER || 'kumarkunalkk0@gmail.com';
  const senderPass = process.env.SMTP_PASS || 'fhxcqnlbggdxailk';

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #0284c7; margin-top: 0; margin-bottom: 8px;">ASK TRANSPORT</h2>
      <p style="color: #64748b; font-size: 13px; margin-top: 0;">LOGISTICS &amp; SUPPLY CHAIN</p>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your one-time verification code for ASK Transport account registration is:</p>
      <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0;">
        <span style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #166534; font-family: monospace;">${generatedOtp}</span>
      </div>
      <p style="color: #64748b; font-size: 13px;">This code is valid for 10 minutes. Please do not share this OTP with anyone.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px; margin-bottom: 0;">ASK Transport Group &bull; Logistics & Supply Chain Fleet Management</p>
    </div>
  `.trim();

  const dispatchResult = await sendSmtpEmail({
    from: senderEmail,
    to: email,
    password: senderPass,
    subject: `${generatedOtp} is your ASK Transport verification code`,
    htmlBody
  });

  return res.status(200).json({
    success: true,
    emailDelivered: dispatchResult.success,
    deliveryError: dispatchResult.error || null,
    otp: generatedOtp,
    email,
    message: dispatchResult.success
      ? `Verification code successfully dispatched to ${email}.`
      : `Email dispatch failed: ${dispatchResult.error}`
  });
}
