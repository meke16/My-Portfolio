import React from "react";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";
import BlogSection from "../components/BlogSection";

function BlogPage() {
  const { blogs } = useFirestorePortfolio();
  return <BlogSection blogs={blogs} />;
}

export { BlogPage };
export default BlogPage;
