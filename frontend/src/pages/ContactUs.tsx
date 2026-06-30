import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import Button from '../components/ui/Button';
import SEO from '../components/ui/SEO';

export const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must not exceed 100 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    } else if (formData.subject.trim().length > 200) {
      newErrors.subject = 'Subject must not exceed 200 characters';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = 'Message must not exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setErrors({});
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-10 md:pt-14 pb-20 bg-light-bg/30 min-h-screen">
      <SEO
        title="Contact Us"
        description="Get in touch with the Amader Barir Pujo organizing committee. Call, email, or visit us in Wakad, Pune during the Durga Puja celebrations."
        keywords="Contact Amader Barir Pujo, Durga Puja Pune contact, Bengali community Wakad Pune"
      />
      <div className="max-w-6xl mx-auto px-6">
        {/* Title */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-950 font-fraunces mb-3">
            Contact Us
          </h1>
          <p className="text-sm text-muted font-medium">
            Have questions? Feel free to reach out to our organizing committee.
          </p>
          <motion.div 
            className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column: Details & Map */}
          <motion.div 
            className="space-y-6 select-text"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold font-fraunces text-primary">Get In Touch</h2>
              
              <ul className="space-y-4 text-sm list-none p-0 m-0">
                <li className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <FaPhoneAlt size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted font-bold uppercase tracking-widest block">Call Us</span>
                    <a href="tel:+123478390" className="font-semibold text-secondary hover:text-primary transition-colors">+123 478 390</a>
                  </div>
                </li>
                
                <li className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <FaEnvelope size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted font-bold uppercase tracking-widest block">Email Us</span>
                    <a href="mailto:info@abp.proplusdatafoundation.com" className="font-semibold text-secondary hover:text-primary transition-colors">
                      info@abp.proplusdatafoundation.com
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <FaMapMarkerAlt size={15} />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted font-bold uppercase tracking-widest block">Location</span>
                    <span className="font-semibold text-secondary leading-relaxed block">
                      Mane Wasti, Kemse Vasti, Wakad, Pune
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Google Map */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.427289068342!2d73.74880037372274!3d18.59984136675095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bbec7d32f58d%3A0x43013cca2bb47ceb!2sProPlus%20Data%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1780488340313!5m2!1sen!2sin"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Amader Barir Pujo Location"
              />
            </div>
          </motion.div>

          {/* Right Column: Message Form */}
          <motion.div 
            className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm self-start"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          >
            {submitted ? (
              <motion.div 
                className="text-center py-10 space-y-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 font-bold text-xl">
                  ✓
                </div>
                <h3 className="text-xl font-bold font-fraunces text-primary font-medium">Message Sent</h3>
                <p className="text-xs text-secondary leading-relaxed max-w-xs mx-auto">
                  Thank you! Your message has been submitted. One of our organizing committee members will get back to you as soon as possible.
                </p>
                <button onClick={() => setSubmitted(false)} className="text-xs text-accent-text hover:underline bg-transparent border-0 cursor-pointer">
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 select-text">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ct-name" className="text-xs font-bold text-secondary uppercase tracking-wider">Name</label>
                  <input
                    id="ct-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    className={`px-4 py-3 border text-sm rounded-lg focus:outline-none focus:ring-2 transition-all bg-gray-50/50 ${
                      errors.name 
                        ? 'border-red-500 focus:ring-red-500/40 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-primary/40 focus:border-primary'
                    }`}
                    placeholder="Enter name"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ct-email" className="text-xs font-bold text-secondary uppercase tracking-wider">Email</label>
                  <input
                    id="ct-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`px-4 py-3 border text-sm rounded-lg focus:outline-none focus:ring-2 transition-all bg-gray-50/50 ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500/40 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-primary/40 focus:border-primary'
                    }`}
                    placeholder="Enter email"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ct-subject" className="text-xs font-bold text-secondary uppercase tracking-wider">Subject</label>
                  <input
                    id="ct-subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => {
                      setFormData({ ...formData, subject: e.target.value });
                      if (errors.subject) setErrors({ ...errors, subject: '' });
                    }}
                    className={`px-4 py-3 border text-sm rounded-lg focus:outline-none focus:ring-2 transition-all bg-gray-50/50 ${
                      errors.subject 
                        ? 'border-red-500 focus:ring-red-500/40 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-primary/40 focus:border-primary'
                    }`}
                    placeholder="Enter subject"
                  />
                  {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ct-msg" className="text-xs font-bold text-secondary uppercase tracking-wider">Message</label>
                  <textarea
                    id="ct-msg"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: '' });
                    }}
                    className={`px-4 py-3 border text-sm rounded-lg focus:outline-none focus:ring-2 transition-all bg-gray-50/50 resize-y ${
                      errors.message 
                        ? 'border-red-500 focus:ring-red-500/40 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-primary/40 focus:border-primary'
                    }`}
                    placeholder="Type your message here..."
                  />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  className="py-3 text-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </motion.div>

        </div>

      </div>
    </div>
  );
};

export default ContactUs;

