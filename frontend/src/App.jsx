import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirestorePortfolioProvider } from "./context/FirestorePortfolioContext";
import { PublicLayout } from "./pages/PublicLayout";
import Admin from "./pages/Admin";

function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <FirestorePortfolioProvider>
        <Routes>
          <Route path="/*" element={<PublicLayout />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </FirestorePortfolioProvider>
    </BrowserRouter>
  );
}

export { App };
export default App;
