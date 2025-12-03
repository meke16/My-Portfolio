import axios from 'axios';

// 1. Automatically determine the API URL based on the environment
const API_BASE = process.env.NODE_ENV === 'production' ? "https://cher-api.vercel.app/api" : "http://localhost:4000/api";

export async function getPortfolioData() {
  try {

    const response = await axios.get(`${API_BASE}/portfolio`);

    return response.data;

  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

export async function sendContactForm(formData) {
  const plain = Object.fromEntries(formData.entries());

  try {
    const result = await axios.post(`${API_BASE}/contact`, formData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return result.data
  } catch (error) {
    console.log("Error", error.message)
  }
}
