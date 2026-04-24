import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, subject, message, replyTo } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_TO } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_TO) {
    return res.status(500).json({ error: "SMTP not configured" });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  // Email sent to you (the portfolio owner)
  const mailOptions = {
    from: `"${name}" <${SMTP_USER}>`,
    to: SMTP_TO,
    replyTo: email,
    subject: subject || `New contact from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p><strong>Subject:</strong> ${subject || "—"}</p><hr/><p style="white-space:pre-wrap">${message}</p>`,
  };

  // If replyTo is set, this is a reply from the dashboard — send to the original sender
  if (replyTo) {
    mailOptions.to = replyTo;
    mailOptions.from = `"Portfolio" <${SMTP_USER}>`;
    mailOptions.replyTo = SMTP_USER;
    mailOptions.subject = subject || `Re: message from ${name}`;
    mailOptions.text = message;
    mailOptions.html = `<p style="white-space:pre-wrap">${message}</p>`;
  }

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("SMTP error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
