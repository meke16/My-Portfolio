import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirestorePortfolioProvider } from "./context/FirestorePortfolioContext";
import { PublicLayout } from "./pages/PublicLayout";
import { Portfolio } from "./pages/Portfolio";
import { AboutPage } from "./pages/AboutPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { SkillsPage } from "./pages/SkillsPage";
import { ContactPage } from "./pages/ContactPage";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <FirestorePortfolioProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Portfolio />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </FirestorePortfolioProvider>
    </BrowserRouter>
  );
}
