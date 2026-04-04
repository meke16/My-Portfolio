import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirestorePortfolioProvider } from "./context/FirestorePortfolioContext";
import Portfolio from "./pages/Portfolio";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <FirestorePortfolioProvider>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </FirestorePortfolioProvider>
    </BrowserRouter>
  );
}
