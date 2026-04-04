import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirestorePortfolioProvider } from "./context/FirestorePortfolioContext";
import * as PublicLayoutModule from "./pages/PublicLayout";
import * as PortfolioModule from "./pages/Portfolio";
import * as AboutPageModule from "./pages/AboutPage";
import * as ProjectsPageModule from "./pages/ProjectsPage";
import * as SkillsPageModule from "./pages/SkillsPage";
import * as ContactPageModule from "./pages/ContactPage";
import Admin from "./pages/Admin";

function pickComponent(moduleObj, namedExport) {
  return moduleObj[namedExport] || moduleObj.default || (() => null);
}

const PublicLayout = pickComponent(PublicLayoutModule, "PublicLayout");
const Portfolio = pickComponent(PortfolioModule, "Portfolio");
const AboutPage = pickComponent(AboutPageModule, "AboutPage");
const ProjectsPage = pickComponent(ProjectsPageModule, "ProjectsPage");
const SkillsPage = pickComponent(SkillsPageModule, "SkillsPage");
const ContactPage = pickComponent(ContactPageModule, "ContactPage");

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
