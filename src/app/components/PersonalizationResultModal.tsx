"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PersonalizationResultModalProps {
  category: "Connection & Social" | "Self-Care & Wellness" | "Growth & Expression";
  onClose: () => void;
}

export const PersonalizationResultModal: React.FC<PersonalizationResultModalProps> = ({
  category,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-popUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 8L8 24M8 8L24 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Character Image */}
        <div className="flex justify-center mb-6">
          <img
            src="/tiny.svg"
            alt="Character"
            className="w-48 h-48 object-contain"
          />
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">
            You feel better with...
          </h2>
          <h3 className="text-3xl font-bold text-blue-600 mb-6">
            {category}
          </h3>
          <p className="text-gray-600 text-lg">
            You're <span className="text-blue-600 font-semibold">daily task</span> is now personalized<br />
            based on your questionnaire result!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes popUp {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          50% {
            transform: scale(1.05) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-popUp {
          animation: popUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>,
    document.body
  );
};
