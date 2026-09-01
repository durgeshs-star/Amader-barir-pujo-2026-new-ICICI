import React, { useEffect } from 'react';

interface BookingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingSoonModal: React.FC<BookingSoonModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = window.setTimeout(() => {
      onClose();
    }, 7000);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 md:top-40 top-25 md:right-135 right-0 z-1200 flex justify-center px-3 sm:px-4 sm:justify-end sm:pr-6">
      <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-primary/20 bg-white/95 p-4 shadow-2xl shadow-black/10 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-base font-bold text-primary sm:text-lg">
              Bhog Bookings will open soon
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Thank you for your interest. Bhog bookings will be available shortly.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-light-bg px-2 py-1 text-xs font-medium text-secondary transition-colors hover:text-primary"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSoonModal;
