import React, { useState } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { FaUser, FaEnvelope, FaPhone, FaArrowRight, FaHeart, FaUsers, FaHandHoldingHeart, FaCalendarAlt } from "react-icons/fa";
import PageHero from "../components/common/PageHero";
import Button from "../components/ui/Button";
import SEO from "../components/ui/SEO";
import { toast } from 'react-toastify';
import { apiService } from '../services/api';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const inputCls = (hasError: boolean) =>
  `w-full pl-11 pr-4 py-3 border text-sm rounded-lg focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? "border-red-400 focus:ring-red-400/40 focus:border-red-500"
      : "border-gray-200 focus:ring-primary/40 focus:border-primary"
  }`;

export const Volunteer: React.FC = React.memo(() => {
  return (
    <LazyMotion features={domAnimation} strict>
      <VolunteerContent />
    </LazyMotion>
  );
});

const VolunteerContent: React.FC = React.memo(() => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Full name is required";
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required";
    } else if (!emailRx.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = "Phone number is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await apiService.submitVolunteer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });

      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
      setErrors({});
      toast.success('Volunteer form submitted successfully!');
    } catch (error) {
      console.error('Error submitting volunteer form:', error);
      toast.error('Submission failed. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const change =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  return (
    <>
      <SEO
        title="Volunteer | Amader Barir Pujo"
        description="Join Amader Barir Pujo as a volunteer to serve the community during Durga Puja 2026 in Wakad, Pune. Offer your seva, build community connections, and make a difference in our vibrant Bengali celebration."
        keywords="Volunteer Durga Puja Pune, Amader Barir Pujo volunteer, community seva Wakad, Bengali festival volunteer Pune, Durga Puja seva opportunities"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/volunteer"
      />

      <PageHero
        title="Be a Bari Sadasya"
        height="h-[40vh] md:h-[60vh]"
      />

      {/* Why Volunteer Section */}
      <section className="content-layer py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-fraunces text-3xl md:text-5xl font-bold text-primary mb-4">
              Become Part of Our Pujo Story
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto text-lg text-center">
              Maa brings us together.
Come with your time, your talent, or simply your heart. Together, let's create a Pujo that every visitor will remember and every volunteer will cherish.

            </p>
            <div className="w-16 h-1 bg-accent mx-auto mt-6 rounded-full" />
          </m.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaHeart size={32} />,
                title: "Serve with Devotion",
                description: "Offer your seva to Maa Durga and participate in sacred rituals that bring blessings to the entire community."
              },
              {
                icon: <FaUsers size={32} />,
                title: "Build Community",
                description: "Connect with like-minded individuals and become part of a warm, welcoming Bengali family in Pune."
              },
              {
                icon: <FaHandHoldingHeart size={32} />,
                title: "Make a Difference",
                description: "Your contribution helps create memorable celebrations and brings joy to thousands of devotees."
              }
            ].map((item, idx) => (
              <m.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
className="bg-light-bg rounded-xl p-8 text-center hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary mb-6">
                  {item.icon}
                </div>
                <h3 className="font-fraunces text-xl font-bold text-primary mb-3">
                  {item.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {item.description}
                </p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="content-layer py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-fraunces text-3xl md:text-5xl font-bold text-primary mb-4">
              Join Our Volunteer Team
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto text-lg text-center">
              Fill out the form below and we'll get in touch with you about upcoming opportunities.
            </p>
            <div className="w-16 h-1 bg-accent mx-auto mt-6 rounded-full" />
          </m.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Info */}
            <m.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="bg-light-bg rounded-xl p-6 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <FaCalendarAlt size={20} />
                  </div>
                  <div>
                    <h3 className="font-fraunces text-lg font-bold text-primary mb-2">
                      Pujo Dates 2026
                    </h3>
                    <p className="text-text-secondary text-sm">
                      October 15-20, 2026<br />
                      Wakad, Pune
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-light-bg rounded-xl p-6 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <FaUsers size={20} />
                  </div>
                  <div>
                    <h3 className="font-fraunces text-lg font-bold text-primary mb-2">
                      What We Expect
                    </h3>
                    <ul className="text-text-secondary text-sm space-y-2">
                      <li>• Commitment during Pujo days</li>
                      <li>• Team spirit and cooperation</li>
                      <li>• Respect for traditions</li>
                      <li>• Positive attitude</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-light-bg rounded-xl p-6 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <FaHeart size={20} />
                  </div>
                  <div>
                    <h3 className="font-fraunces text-lg font-bold text-primary mb-2">
                      What You'll Receive
                    </h3>
                    <ul className="text-text-secondary text-sm space-y-2">
                      <li>• Prasad and meals during Pujo</li>
                      <li>• Volunteer certificate</li>
                      <li>• Community recognition</li>
                      <li>• Lifelong friendships</li>
                    </ul>
                  </div>
                </div>
              </div>
            </m.div>

            {/* Right Side - Form */}
            <m.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
          {submitted ? (
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl p-8 md:p-10 border border-gray-100 shadow-lg text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 text-2xl font-bold">
                ✓
              </div>
              <h2 className="text-2xl font-bold font-fraunces text-primary mt-5">
                Thank You!
              </h2>
              <p className="text-sm text-secondary leading-relaxed mt-3">
                Your volunteer form has been submitted. Our team will get in
                touch with you soon.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm font-semibold text-accent-text hover:underline bg-transparent border-0 cursor-pointer"
              >
                Submit another response
              </button>
            </m.div>
          ) : (
            <m.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl p-6 md:p-10 border border-gray-100 shadow-lg"
            >
              <div className="text-center mb-8">
                <h2 className="font-fraunces text-2xl md:text-3xl font-bold text-primary">
                  Volunteer Form
                </h2>
                <div className="w-12 h-1 bg-accent mx-auto mt-4 rounded-full" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="vol-name" className="sr-only">
                    Full Name
                  </label>
                  <div className="relative">
                    <FaUser
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                      size={14}
                      aria-hidden="true"
                    />
                    <input
                      id="vol-name"
                      type="text"
                      name="fname"
                      value={formData.name}
                      onChange={change("name")}
                      placeholder="Full Name"
                      className={inputCls(!!errors.name)}
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="vol-email" className="sr-only">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                      size={14}
                      aria-hidden="true"
                    />
                    <input
                      id="vol-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={change("email")}
                      placeholder="Email Address"
                      className={inputCls(!!errors.email)}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="vol-phone" className="sr-only">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FaPhone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                      size={14}
                      aria-hidden="true"
                    />
                    <input
                      id="vol-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={change("phone")}
                      placeholder="Phone Number"
                      className={inputCls(!!errors.phone)}
                      autoComplete="tel"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="vol-message" className="sr-only">
                    Message
                  </label>
                  <textarea
                    id="vol-message"
                    name="message"
                    rows={10}
                    value={formData.message}
                    onChange={change("message")}
                    placeholder="Enter Message"
                    className="w-full px-4 py-3 border border-gray-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-y"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  rightIcon={!isSubmitting ? <FaArrowRight size={14} /> : undefined}
                  className="py-3.5"
                >
                  {isSubmitting ? "Submitting…" : "Submit"}
                </Button>
              </form>
            </m.div>
          )}
            </m.div>
          </div>
        </div>
      </section>
    </>
  );
});

export default Volunteer;
