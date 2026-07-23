import { useState, forwardRef, useImperativeHandle } from 'react';

export interface UserInfo {
  name: string;
  phone: string;
  email: string;
}

export interface UserInfoFormRef {
  validateForm: () => boolean;
  getUserInfo: () => UserInfo;
}

interface UserInfoFormProps {
  onFormChange: (isFilled: boolean) => void;
  disabled?: boolean;
}

export const UserInfoForm = forwardRef<UserInfoFormRef, UserInfoFormProps>(({ onFormChange, disabled = false }, ref) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof UserInfo, string>>>({});

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

  useImperativeHandle(ref, () => ({
    validateForm,
    getUserInfo: () => ({ name, phone, email })
  }));

  const handleFieldChange = (field: keyof UserInfo, value: string) => {
    // Clear error for this field when user starts typing
    setErrors(prev => ({ ...prev, [field]: null }));
    
    let newName = name;
    let newPhone = phone;
    let newEmail = email;

    switch (field) {
      case 'name':
        newName = value;
        setName(value);
        break;
      case 'phone':
        newPhone = value;
        setPhone(value);
        break;
      case 'email':
        newEmail = value;
        setEmail(value);
        break;
    }

    const isFilled = newName.trim() !== '' && newPhone.trim() !== '' && newEmail.trim() !== '';
    onFormChange(isFilled);
  };

  return (
    <>
      {/* Mobile Form - Compact design */}
      <div className="p-4 border-2 border-gray-200 rounded-xl bg-white lg:hidden">
        <h3 className="text-xl font-bold text-primary mb-4 font-fraunces">Contact Information</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-primary mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              disabled={disabled}
              placeholder="Enter your full name"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-primary mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              disabled={disabled}
              placeholder="Enter your 10-digit phone number"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-primary mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              disabled={disabled}
              placeholder="Enter your email address"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* Desktop Form - Original design */}
      <div className="hidden lg:block p-4 border border-primary/14 rounded-lg bg-gradient-to-br from-white to-orange-50/50 shadow-lg">
        <h3 className="text-lg font-bold text-primary mb-4 font-fraunces">Contact Information</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name-desktop" className="block text-sm font-semibold text-primary mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name-desktop"
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
            <label htmlFor="phone-desktop" className="block text-sm font-semibold text-primary mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone-desktop"
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
            <label htmlFor="email-desktop" className="block text-sm font-semibold text-primary mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email-desktop"
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
      </div>
    </>
  );
});

export default UserInfoForm;
