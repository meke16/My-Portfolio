export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://chere.lovestoblog.com/api/contact.php', {
      method: 'POST',
      body: req.body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const data = await response.json();

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error sending contact form',
      error: err.message,
    });
  }
}
