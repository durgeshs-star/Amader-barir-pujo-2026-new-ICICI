import React from 'react';

interface BhogSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  categories: Array<{
    id: string;
    title: string;
    quantity: number;
    price: number;
  }>;
  totalCount: number;
}


export const BhogSuccessModal: React.FC<BhogSuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  categories,
  totalCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="font-fraunces text-2xl font-bold text-primary mb-2">
            Bhog Booked Successfully!
          </h3>
          <p className="text-secondary mb-6">
            Your free bhog booking has been recorded. We look forward to seeing you!
          </p>

          {/* Booking Details */}
          <div className="bg-orange-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-primary mb-3">{title}</p>
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex justify-between text-sm"
                >
                  <span className="text-secondary">{category.title}</span>
                  <span className="font-semibold text-primary">
                    x{category.quantity}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-orange-200 mt-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-primary">Total</span>
                  <span className="text-primary">{totalCount} booking(s)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 mb-6">
            Please bring valid ID proof for children aged 0-5 years for verification.
          </p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BhogSuccessModal;
