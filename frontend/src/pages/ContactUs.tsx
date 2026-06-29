import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import Button from '../components/ui/Button';

export const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact Message Submitted:', formData);
    setSubmitted(true);
  };

  return (
    <div className="pt-24 md:pt-32 pb-20 bg-light-bg/30 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-950 font-fraunces mb-3">
            Contact Us
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Have questions? Feel free to reach out to our organizing committee.
          </p>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column: Details & Map mockup */}
          <div className="space-y-6 select-text">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold font-fraunces text-primary">Get In Touch</h2>
              
              <ul className="space-y-4 text-sm list-none p-0 m-0">
                <li className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <FaPhoneAlt size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Call Us</span>
                    <a href="tel:+919879879302" className="font-semibold text-gray-800 hover:text-primary transition-colors">+91 987 987 9302</a>
                  </div>
                </li>
                
                <li className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <FaEnvelope size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Email Us</span>
                    <a href="mailto:info@abp.proplusdatafoundation.com" className="font-semibold text-gray-800 hover:text-primary transition-colors">
                      info@abp.proplusdatafoundation.com
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <FaMapMarkerAlt size={15} />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Location</span>
                    <span className="font-semibold text-gray-800 leading-relaxed block">
                      Wakad, Pune, Pimpri-Chinchwad, Maharashtra 411057
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center items-center h-56 select-none relative overflow-hidden">
              {/* Fallback stylized Map wrapper */}
              <div className="absolute inset-0 bg-slate-100 flex flex-col justify-center items-center text-gray-400">
                <FaMapMarkerAlt className="text-primary text-4xl animate-bounce" />
                <span className="text-xs uppercase font-bold text-gray-650 tracking-wider mt-3">Wakad, Pune</span>
                <span className="text-[10px] text-gray-500 mt-1">Interactive Map will load here</span>
              </div>
            </div>
          </div>

          {/* Right Column: Message Form */}
          <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm self-start">
            <h2 className="text-2xl font-bold font-fraunces text-primary mb-6">Send A Message</h2>
            
            {submitted ? (
              <div className="text-center py-10 space-y-4 animate-fade-in">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 font-bold text-xl">
                  ✓
                </div>
                <h3 className="text-xl font-bold font-fraunces text-primary font-medium">Message Sent</h3>
                <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
                  Thank you! Your message has been submitted. One of our organizing committee members will get back to you as soon as possible.
                </p>
                <button onClick={() => setSubmitted(false)} className="text-xs text-accent hover:underline bg-transparent border-0 cursor-pointer">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 select-text">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ct-name" className="text-xs font-bold text-gray-750 uppercase tracking-wider">Name</label>
                  <input
                    id="ct-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="px-4 py-3 border border-gray-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-gray-50/50"
                    placeholder="Enter name"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ct-email" className="text-xs font-bold text-gray-750 uppercase tracking-wider">Email</label>
                  <input
                    id="ct-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="px-4 py-3 border border-gray-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-gray-50/50"
                    placeholder="Enter email"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ct-msg" className="text-xs font-bold text-gray-750 uppercase tracking-wider">Message</label>
                  <textarea
                    id="ct-msg"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="px-4 py-3 border border-gray-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-gray-50/50 resize-y"
                    placeholder="Type your message here..."
                  />
                </div>

                <Button type="submit" variant="primary" fullWidth className="py-3 text-sm">
                  Send Message
                </Button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ContactUs;
