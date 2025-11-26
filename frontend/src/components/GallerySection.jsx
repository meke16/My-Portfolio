import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowBigDownDashIcon,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Play,
  View,
  WatchIcon,
  X,
} from "lucide-react";

const GallerySection = ({ items }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Lock body scroll when gallery is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => (document.body.style.overflow = "unset");
  }, [selectedIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  const showPrev = (e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const showNext = (e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No portfolio items found.
      </div>
    );
  }

  const currentItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <section
      id="gallery"
      className="min-h-screen bg-gray-950 py-20 px-4 sm:px-8 border-t border-gray-900"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4">
            Selected Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A curation of my recent projects and visual experiments.
          </p>
        </div>

        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <motion.div
              layoutId={`card-${idx}`}
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 cursor-pointer shadow-lg hover:shadow-yellow-500/10 transition-colors duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={item.thumbnail_url || item.media_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                {/* Overlay text */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  View {item.media_type == "video" ? "Video" : "photo"}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- FULL SCREEN IMMERSIVE VIEW --- */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-gray-950"
          >
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between p-6 z-20 bg-gradient-to-b from-black/80 to-transparent">
              <button
                onClick={() => setSelectedIndex(null)}
                className="flex items-center gap-2 text-white/80 hover:text-yellow-400 transition-colors group"
              >
                <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition">
                  <ArrowLeft size={20} />
                </div>
                <span className="font-medium tracking-wide">
                  Back to Gallery
                </span>
              </button>

              <div className="text-white/50 text-sm font-mono hidden sm:block">
                {selectedIndex + 1} / {items.length}
              </div>

              {/* Mobile Close X (redundant but good for UX) */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="sm:hidden text-white/80"
              >
                <X size={28} />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative flex items-center justify-center p-4 sm:p-12 overflow-hidden">
              {/* Previous Button */}
              <button
                onClick={showPrev}
                className="absolute left-4 sm:left-8 z-20 p-3 rounded-full bg-black/40 text-white hover:bg-yellow-500 hover:text-black border border-white/10 hover:border-transparent transition-all backdrop-blur-sm group"
              >
                <ChevronLeft
                  size={32}
                  className="group-hover:-translate-x-1 transition-transform"
                />
              </button>

              {/* Media Container */}
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full max-w-7xl flex flex-col items-center justify-center"
              >
                {currentItem.media_type === "image" ? (
                  <img
                    src={currentItem.media_url}
                    alt={currentItem.title}
                    className="max-h-[70vh] w-auto object-contain rounded-lg shadow-2xl shadow-black/50"
                  />
                ) : (
                  <div className="w-full h-full max-h-[70vh] flex items-center justify-center">
                    <iframe
                      src={currentItem.media_url}
                      title={currentItem.title}
                      className="w-full h-full aspect-video rounded-lg shadow-2xl"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

                {/* Caption / Details */}
                <div className="mt-8 text-center max-w-2xl">
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-white mb-3"
                  >
                    {currentItem.title}
                  </motion.h2>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-400 text-lg leading-relaxed"
                  >
                    {currentItem.description}
                  </motion.p>
                </div>
              </motion.div>

              {/* Next Button */}
              <button
                onClick={showNext}
                className="absolute right-4 sm:right-8 z-20 p-3 rounded-full bg-black/40 text-white hover:bg-yellow-500 hover:text-black border border-white/10 hover:border-transparent transition-all backdrop-blur-sm group"
              >
                <ChevronRight
                  size={32}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            {/* Background Blur Effect */}
            <div className="absolute inset-0 -z-10">
              <img
                src={currentItem.thumbnail_url || currentItem.media_url}
                className="w-full h-full object-cover blur-3xl opacity-20"
                alt="background blur"
              />
              <div className="absolute inset-0 bg-gray-950/80" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;
