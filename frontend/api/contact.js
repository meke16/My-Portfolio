export const config = {
  api: {
    bodyParser: false, // because you're sending FormData
  },
};

export default async function handler(req, res) {
  try {
    const response = await fetch("http://cher-portfolio.test/api/contact.php", {
      method: "POST",
      body: req.body,
    });

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending contact form",
      error: error.toString(),
    });
  }
}
