import React from "react";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";
import { SkillsSection } from "../components/SkillsSection";

function SkillsPage() {
  const { skills } = useFirestorePortfolio();
  return <SkillsSection skills={skills} />;
}

export { SkillsPage };
export default SkillsPage;
