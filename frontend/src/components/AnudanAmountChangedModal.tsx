/**
 * Anudan Amount Changed Modal
 * 
 * Displays when an Anudan payment fails due to insufficient remaining amount.
 * Shows the current remaining amount and the user's selected amount.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnudanAmountChangedModalProps {
  isOpen: boolean;
  remainingAmount: number;
  requestedAmount: number;
  onAdjust: () => void;
}

export const AnudanAmountChangedModal: React.FC<AnudanAmountChangedModalProps> = ({
  isOpen,
  remainingAmount,
  requestedAmount,
  onAdjust,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full">
                <svg
                  className="w-8 h-8 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 font-fraunces">
                🙏 Anudan Amount Has Changed
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Another devotee has completed their Anudan before yours. The remaining Anudan amount is now ₹{remainingAmount.toLocaleString('en-IN')}, but you attempted to contribute ₹{requestedAmount.toLocaleString('en-IN')}. Please adjust your Anudan amount and try again.
              </p>
            </div>

            {/* Amount Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Remaining Amount</span>
                <span className="text-lg font-bold text-green-600">
                  ₹{remainingAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Your Selected Amount</span>
                <span className="text-lg font-bold text-red-600">
                  ₹{requestedAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onAdjust}
              className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200"
            >
              Adjust My Anudan
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
