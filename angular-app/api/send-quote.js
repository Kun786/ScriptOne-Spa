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
    return res.status(400).json({ ok: false, message: 'Invalid payload' });
  }

  const smtpUser = process.env.SMTP_USER || 'hello@scriptone.io';
  const smtpPass = process.env.SMTP_PASS || 'yxhl-cyvi-ypws-jwcw';
  if (!smtpUser || !smtpPass) {
    return res.status(500).json({ ok: false, message: 'Email server is not configured' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const body =
      `Customer Name  : ${name.trim()}\n` +
      `Customer Email: ${email.trim()}\n` +
      `Services Required: ${service.trim()}\n` +
      `Customer Description: ${description.trim()}`;

    await transporter.sendMail({
      from: `"ScriptOne Website" <${smtpUser}>`,
      to: 'hello@scriptone.io',
      subject: 'Scriptone Project Quote',
      text: body,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Quote email failed:', error);
    return res.status(500).json({ ok: false, message: 'Unable to send email' });
  }
};

