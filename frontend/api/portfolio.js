export default async function handler(req, res) {
  try {
    const response = await fetch("https://chere.lovestoblog.com/api/portfolio.php");
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching portfolio",
      error: error.toString(),
    });
  }
}
