import React, { useState } from "react";

function GallerySection({ info }) {
  const galleryImages = info;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const showPrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));

  const showNext = () =>
    setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));

  if (!galleryImages || galleryImages.length === 0) {
    return (
      <div className="text-center text-gray-500 p-12">
        No gallery images found.
      </div>
    );
  }

  return (
    <>
      <section id="gallery" className="min-h-screen p-8 sm:p-12 bg-gray-950 border-t border-gray-800">
        <h2 className="text-4xl font-bold text-center text-yellow-400 mb-12">
          Visual Gallery Showcase
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((url, idx) => (
            <div
              key={idx}
              onClick={() => openLightbox(idx)}
              className="group relative overflow-hidden rounded-xl shadow-2xl cursor-pointer aspect-video hover:scale-105 transition-all duration-300 border-2 border-gray-700 hover:border-yellow-500"
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-fade">
          
          {/* Close button */}
          <button
            className="absolute top-6 right-6 text-white text-3xl"
            onClick={closeLightbox}
          >
            &times;
          </button>

          {/* Prev Button */}
          <button
            className="absolute left-4 text-white text-4xl px-3 py-1 bg-black/40 rounded-full"
            onClick={showPrev}
          >
            &#10094;
          </button>

          {/* Next Button */}
          <button
            className="absolute right-4 text-white text-4xl px-3 py-1 bg-black/40 rounded-full"
            onClick={showNext}
          >
            &#10095;
          </button>

          {/* Image */}
          <img
            src={galleryImages[currentIndex]}
            className="max-w-3xl max-h-[85vh] rounded-lg shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

export default GallerySection;
