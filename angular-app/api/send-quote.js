const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const { name, email, service, description } = req.body || {};

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
  if (
    !name || name.trim().length < 2 || name.trim().length > 80 ||
    !emailValid ||
    !service || !service.trim() ||
    !description || description.trim().length < 15 || description.trim().length > 2000
  ) {
    return res.status(400).json({ ok: false, message: 'Invalid form data. Please check all fields.' });
  }

  const smtpUser = process.env.SMTP_USER || 'hello@scriptone.io';
  // Strip dashes from app password — Gmail app passwords are 16 chars with no dashes
  const rawPass = process.env.SMTP_PASS || 'yxhlcyviypwsjwcw';
  const smtpPass = rawPass.replace(/-/g, '');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    await transporter.verify();
  } catch (verifyErr) {
    console.error('SMTP connection failed:', verifyErr);
    return res.status(500).json({
      ok: false,
      message: 'Email server connection failed. Please contact us directly at hello@scriptone.io',
    });
  }

  try {
    const body =
      `Customer Name    : ${name.trim()}\n` +
      `Customer Email   : ${email.trim()}\n` +
      `Service Required : ${service.trim()}\n` +
      `Description      :\n${description.trim()}`;

    await transporter.sendMail({
      from: `"ScriptOne Website" <${smtpUser}>`,
      to: 'hello@scriptone.io',
      replyTo: email.trim(),
      subject: `Scriptone Project Quote — ${service.trim()}`,
      text: body,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Quote email send failed:', error);
    return res.status(500).json({
      ok: false,
      message: 'Unable to send your request right now. Please contact us directly at hello@scriptone.io',
    });
  }
};
