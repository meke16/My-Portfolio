import React from "react";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";
import ProjectsSection from "../components/ProjectsSection";

function ProjectsPage() {
  const { projects } = useFirestorePortfolio();
  return <ProjectsSection projects={projects} />;
}

export { ProjectsPage };
export default ProjectsPage;
