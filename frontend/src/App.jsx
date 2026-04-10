import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { FirestorePortfolioProvider } from "./context/FirestorePortfolioContext";
import { PublicLayout } from "./pages/PublicLayout";
import Admin from "./pages/Admin";

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <FirestorePortfolioProvider>
          <Routes>
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/*" element={<PublicLayout />} />
          </Routes>
        </FirestorePortfolioProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export { App };
export default App;
