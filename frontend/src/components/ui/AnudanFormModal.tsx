import React, { useState } from 'react';
import type { AnudanCard } from '../../types/anudan.types';

interface AnudanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: AnudanCard | null;
  remainingAmount?: number;
}

export const AnudanFormModal: React.FC<AnudanFormModalProps> = ({
  isOpen,
  onClose,
  card,
  remainingAmount,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !card) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (remainingAmount !== undefined && Number(amount) > remainingAmount) {
      newErrors.amount = `Amount cannot exceed the remaining balance of ₹${remainingAmount.toLocaleString('en-IN')}`;
    }
    if (!remark.trim()) {
      newErrors.remark = 'Remark is required';
    } else if (remark.length > 100) {
      newErrors.remark = 'Remark cannot exceed 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    // Simulate Payment Flow
    setTimeout(() => {
      const orderId = `ANUDAN-${Date.now()}`;
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const numAmount = Number(amount);

      const anudanReceiptData = {
        orderId,
        transactionId,
        title: `Anudan Offering - ${card.day}`,
        // cardDay is used by PaymentSuccess to track remaining amount in localStorage
        cardDay: card.day,
        categories: [
          {
            id: 'anudan-contribution',
            title: 'Anudan Contribution',
            price: numAmount,
            description: remark,
            max: 1,
            quantity: 1,
          }
        ],
        totalAmount: numAmount,
        totalCount: 1,
        timestamp: new Date().toISOString(),
        userInfo: { name, phone, email }
      };

      // Store in sessionStorage to be read by BhogReceipt / PaymentSuccess
      sessionStorage.setItem('bhogReceipt', JSON.stringify(anudanReceiptData));

      // Redirect to payment success page
      window.location.href = `/payment/success?orderId=${orderId}&transactionId=${transactionId}&amount=${numAmount}&currency=INR&fromBhog=true`;
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          <h3 className="font-fraunces text-2xl font-bold text-primary mb-2">
            Offer Anudan
          </h3>
          <p className="text-secondary mb-6 text-sm">
            For {card.day}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="anudan-name" className="block text-sm font-semibold text-primary mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="anudan-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="Enter your full name"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="anudan-phone" className="block text-sm font-semibold text-primary mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="anudan-phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="Enter your 10-digit mobile number"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="anudan-email" className="block text-sm font-semibold text-primary mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="anudan-email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="Enter your email address"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="anudan-amount" className="block text-sm font-semibold text-primary mb-1">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id="anudan-amount"
                value={amount}
                onChange={(e) => {
                  // Only allow digits
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setAmount(val);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
                }}
                placeholder="Enter amount"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              {remainingAmount !== undefined && !errors.amount && (
                <p className="text-gray-500 text-xs mt-1">Remaining balance: ₹{remainingAmount.toLocaleString('en-IN')}</p>
              )}
            </div>

            <div>
              <label htmlFor="anudan-remark" className="block text-sm font-semibold text-primary mb-1">
                Remark <span className="text-red-500">*</span>
              </label>
              <textarea
                id="anudan-remark"
                value={remark}
                onChange={(e) => {
                  setRemark(e.target.value);
                  if (errors.remark) setErrors((prev) => ({ ...prev, remark: '' }));
                }}
                placeholder="Any special remarks (max 100 characters)"
                rows={2}
                maxLength={100}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none ${errors.remark ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              <div className="flex justify-between mt-1">
                {errors.remark ? (
                  <p className="text-red-500 text-xs">{errors.remark}</p>
                ) : (
                  <span />
                )}
                <span className={`text-xs ${remark.length >= 100 ? 'text-red-500' : 'text-gray-500'}`}>
                  {remark.length}/100
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnudanFormModal;
