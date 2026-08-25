import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BhogBookingSection from './BhogBookingSection';
import { BHOG_BOOKING_CATEGORIES } from '../../config/pujaConfig';
import { isBookingClosed, getPujaName, getCutoffTimestamp } from '../../utils/bookingUtils';
import { logBookingBlocked } from '../../utils/logger';
import type { BhogBookingCategory } from '../../types/bhog';

interface PujaBookingCardProps {
  pujaKey: string;
  title: string;
  subtitle: string;
  description: string;
  paymentUrl: string;
  disclaimer: string;
}

export const PujaBookingCard: React.FC<PujaBookingCardProps> = ({
  pujaKey,
  title,
  subtitle,
  description,
  paymentUrl,
  disclaimer,
}) => {
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Check booking status on mount
    const closed = isBookingClosed(pujaKey);
    setIsClosed(closed);

    // Log if booking is blocked
    if (closed) {
      const cutoffTime = getCutoffTimestamp(pujaKey);
      if (cutoffTime) {
        logBookingBlocked(pujaKey, cutoffTime);
      }
    }

    // Re-check every 60 seconds
    const interval = setInterval(() => {
      const newClosedStatus = isBookingClosed(pujaKey);
      setIsClosed(newClosedStatus);
      
      // Log if booking becomes blocked
      if (newClosedStatus && !closed) {
        const cutoffTime = getCutoffTimestamp(pujaKey);
        if (cutoffTime) {
          logBookingBlocked(pujaKey, cutoffTime);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [pujaKey]);

  const pujaName = getPujaName(pujaKey);

  return (
    <>
      {/* <div className="text-center mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        {isClosed ? (
          <p className="text-center text-red-800 text-sm font-semibold">
            ⚠️ Bookings are now closed for {pujaName}
          </p>
        ) : (
          <p className="text-center text-amber-800 text-sm font-semibold">
            ⚠️ Payment Gateway Integration is in Progress.
          </p>
        )}
      </div> */}

      {isClosed ? (
        <div className="border-2 border-red-200 rounded-2xl p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-red-800 font-fraunces mb-2">
            Bookings Closed
          </h3>
          <p className="text-gray-600 mb-6">
            The booking deadline for {pujaName} has passed. Thank you for your interest!
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Return to Home
          </Link>
        </div>
      ) : (
        <BhogBookingSection
          title={title}
          subtitle={subtitle}
          description={description}
          categories={BHOG_BOOKING_CATEGORIES as BhogBookingCategory[]}
          paymentUrl={paymentUrl}
          disclaimer={disclaimer}
        />
      )}
    </>
  );
};

export default PujaBookingCard;
