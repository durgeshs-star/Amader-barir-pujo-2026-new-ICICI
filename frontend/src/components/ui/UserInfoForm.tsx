import React, { useState, useEffect, useRef } from 'react';

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void;
  disabled?: boolean;
}

export interface UserInfo {
  name: string;
  phone: string;
  email: string;
}

export const UserInfoForm: React.FC<UserInfoFormProps> = ({ onSubmit, disabled = false }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof UserInfo, string>>>({});
  const lastSubmittedRef = useRef<string>('');

  const validateField = (field: keyof UserInfo, value: string): string | null => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        return null;
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^[6-9]\d{9}$/.test(value.replace(/\s/g, ''))) return 'Please enter a valid 10-digit phone number';
        return null;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return null;
      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserInfo, string>> = {};

    const nameError = validateField('name', name);
    if (nameError) newErrors.name = nameError;

    const phoneError = validateField('phone', phone);
    if (phoneError) newErrors.phone = phoneError;

    const emailError = validateField('email', email);
    if (emailError) newErrors.email = emailError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof UserInfo, value: string) => {
    // Clear error for this field when user starts typing
    setErrors(prev => ({ ...prev, [field]: null }));
    
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'email':
        setEmail(value);
        break;
    }
  };

  // Auto-submit when form becomes valid
  useEffect(() => {
    if (name && phone && email) {
      const isValid = validateForm();
      if (isValid) {
        const currentData = JSON.stringify({ name, phone, email });
        // Only submit if data has changed since last submission
        if (lastSubmittedRef.current !== currentData) {
          lastSubmittedRef.current = currentData;
          onSubmit({ name, phone, email });
        }
      }
    }
  }, [name, phone, email]);

  return (
    <form className="mt-6 p-6 border border-primary/14 rounded-lg bg-gradient-to-br from-white to-orange-50/50 shadow-lg">
      <h5 className="text-lg font-bold text-primary mb-4 font-fraunces">Contact Information</h5>
      <p className="text-sm text-secondary mb-4">Please fill in your contact details to proceed with the booking.</p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-primary mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            disabled={disabled}
            placeholder="Enter your full name"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-primary mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            disabled={disabled}
            placeholder="Enter your 10-digit phone number"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-primary mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            disabled={disabled}
            placeholder="Enter your email address"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>
    </form>
  );
};

export default UserInfoForm;
