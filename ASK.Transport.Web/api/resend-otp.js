import sendOtpHandler from './send-otp.js';

export default async function handler(req, res) {
  return sendOtpHandler(req, res);
}
