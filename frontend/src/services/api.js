
// 1. Automatically determine the API URL based on the environment
const API_BASE = import.meta.env.PROD 
  ? "https://portfolio-zuca.onrender.com/api"  
  : "http://localhost:4000/api";               

export async function getPortfolioData() {
  try {
    
    const res = await fetch(`${API_BASE}/portfolio`);

    if(!res.ok)
      throw new Error("Failed to fetch data")
  
    return res.json();

  } catch(error) {
      console.log(`Error: ${error.message}`);
  }
}

export async function sendContactForm(formData) {
  const plain = Object.fromEntries(formData.entries());

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(plain)
    });
    
    if(!res.ok)
      throw new Error("Failed to send...not ok response")

    return res.json();
  } catch(error) {
    console.log("Error",error.message)
  } 
}