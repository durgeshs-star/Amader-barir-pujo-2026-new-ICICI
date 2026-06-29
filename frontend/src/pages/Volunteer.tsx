import React, { useState } from 'react';
import Button from '../components/ui/Button';

export const Volunteer: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'bhog',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, submit data to server.
    console.log('Volunteer Request Submitted:', formData);
    setSubmitted(true);
  };

  const departments = [
    { value: 'bhog', label: 'Bhog Serving Seva' },
    { value: 'prasad', label: 'Prasad Distribution' },
    { value: 'crowd', label: 'Crowd & Guest Coordination' },
    { value: 'decor', label: 'Decor & Pandhal Seva' },
    { value: 'cultural', label: 'Cultural Program Support' },
  ];

  return (
    <div className="pt-24 md:pt-32 pb-20 bg-light-bg/30 min-h-screen">
      <div className="max-w-xl mx-auto px-6">
        
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-950 font-fraunces mb-3">
            Volunteer Seva
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Join the family and serve the community during Durga Pujo
          </p>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-md border border-gray-100 select-text">
          {submitted ? (
            <div className="text-center py-8 space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-green-150 rounded-full flex items-center justify-center mx-auto text-green-600 font-bold text-2xl">
                ✓
              </div>
              <h2 className="text-2xl font-bold font-fraunces text-primary">Thank You!</h2>
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                Your volunteer application has been submitted successfully. Our coordination team will get in touch with you shortly. Joy Maa Durga!
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-accent hover:underline bg-transparent border-0 cursor-pointer"
              >
                Submit another application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="vol-name" className="text-xs font-bold text-gray-750 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  id="vol-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-gray-50/50"
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="vol-email" className="text-xs font-bold text-gray-750 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="vol-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-gray-50/50"
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="vol-phone" className="text-xs font-bold text-gray-750 uppercase tracking-wider">
                  WhatsApp Phone Number
                </label>
                <input
                  id="vol-phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-gray-50/50"
                />
              </div>

              {/* Department Choice */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="vol-dept" className="text-xs font-bold text-gray-750 uppercase tracking-wider">
                  Select Seva Department
                </label>
                <select
                  id="vol-dept"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-gray-50/50"
                >
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional message */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="vol-msg" className="text-xs font-bold text-gray-750 uppercase tracking-wider">
                  About Yourself / Past Experience (Optional)
                </label>
                <textarea
                  id="vol-msg"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us a little bit about yourself..."
                  className="px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-gray-50/50 resize-y"
                />
              </div>

              {/* Submit */}
              <Button type="submit" variant="primary" fullWidth className="py-3.5">
                Submit Seva Application
              </Button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Volunteer;
