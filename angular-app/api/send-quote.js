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
  // Gmail App Passwords are 16 chars — strip any spaces or dashes added for readability
  const rawPass = process.env.SMTP_PASS || 'yxhlcyviypwsjwcw';
  const smtpPass = rawPass.replace(/[\s\-]/g, '');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  // Verify SMTP connection before attempting to send
  try {
    await transporter.verify();
  } catch (verifyErr) {
    const errCode = verifyErr?.code || '';
    const errMsg  = verifyErr?.message || String(verifyErr);
    console.error('SMTP verify failed — code:', errCode, '| message:', errMsg);

    let userMessage = 'Email server connection failed. Please contact us directly at hello@scriptone.io';
    if (errCode === 'EAUTH' || errMsg.toLowerCase().includes('invalid') || errMsg.toLowerCase().includes('username')) {
      userMessage = 'Email credentials are incorrect. Please update SMTP_USER / SMTP_PASS environment variables on Vercel.';
    } else if (errCode === 'ETIMEDOUT' || errCode === 'ECONNREFUSED') {
      userMessage = 'Cannot reach Gmail SMTP. Check network/firewall settings.';
    }

    return res.status(500).json({ ok: false, message: userMessage, debug: errCode });
  }

  try {
    const body =
      `Customer Name    : ${name.trim()}\n` +
      `Customer Email   : ${email.trim()}\n` +
      `Service Required : ${service.trim()}\n\n` +
      `Description      :\n${description.trim()}`;

    await transporter.sendMail({
      from: `"ScriptOne Website" <${smtpUser}>`,
      to: 'hello@scriptone.io',
      replyTo: email.trim(),
      subject: `Scriptone Project Quote — ${service.trim()}`,
      text: body,
    });

    return res.status(200).json({ ok: true });
  } catch (sendErr) {
    const errCode = sendErr?.code || '';
    console.error('sendMail failed — code:', errCode, '| error:', sendErr);
    return res.status(500).json({
      ok: false,
      message: 'Unable to send your request right now. Please contact us directly at hello@scriptone.io',
      debug: errCode,
    });
  }
};
