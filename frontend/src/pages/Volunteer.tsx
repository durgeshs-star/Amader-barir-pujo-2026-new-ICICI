import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaPhone, FaArrowRight } from "react-icons/fa";
import Hero from "../components/common/Hero";
import Button from "../components/ui/Button";
import SEO from "../components/ui/SEO";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const inputCls = (hasError: boolean) =>
  `w-full pl-11 pr-4 py-3 border text-sm rounded-lg focus:outline-none focus:ring-2 transition-all bg-white ${
    hasError
      ? "border-red-400 focus:ring-red-400/40 focus:border-red-500"
      : "border-gray-200 focus:ring-primary/40 focus:border-primary"
  }`;

export const Volunteer: React.FC = () => {
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
      const response = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
        setErrors({});
      } else {
        alert("Submission failed. Please try again or contact us directly.");
      }
    } catch {
      alert("Network error. Please check your connection and try again.");
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
        title="Volunteers"
        description="Join Amader Barir Pujo as a volunteer. Sign up to serve the community during Durga Puja 2026 in Wakad, Pune."
        keywords="Volunteer Durga Puja Pune, Amader Barir Pujo volunteer, community seva Wakad"
        ogImage="/assets/img/banner/1.webp"
      />

      <Hero
        title="Volunteers"
        backgroundImage="/assets/img/culture-2.webp"
        height="h-[35vh] md:h-[45vh]"
      />

      <section className="py-14 md:py-20 bg-light-bg/40">
        <div className="max-w-xl mx-auto px-6">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl p-8 md:p-10 border border-gray-100 shadow-lg text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 text-2xl font-bold">
                ✓
              </div>
              <h2 className="text-2xl font-bold font-fraunces text-primary mt-5">
                Thank You!
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-3">
                Your volunteer form has been submitted. Our team will get in
                touch with you soon.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm font-semibold text-accent hover:underline bg-transparent border-0 cursor-pointer"
              >
                Submit another response
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-6 md:p-10 border border-gray-100 shadow-lg"
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                    className="w-full px-4 py-3 border border-gray-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-white resize-y"
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
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
};

export default Volunteer;
