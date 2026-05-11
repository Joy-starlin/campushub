"use client";

import { motion, AnimatePresence } from "framer-motion";
import MultiStepSignup from "./MultiStepSignup";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: 1 | 2 | 3 | 4;
}

export default function SignupModal({ isOpen, onClose, initialStep = 1 }: SignupModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-4 py-12">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md mx-4 sm:mx-0"
          >
            <MultiStepSignup onClose={onClose} initialStep={initialStep as 1 | 2 | 3 | 4} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
