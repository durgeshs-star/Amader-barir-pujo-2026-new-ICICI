import React from "react";
import LegalContent from "../components/ui/LegalContent";
import SEO from "../components/ui/SEO";

const TermsAndConditions: React.FC = () => {
  const sections = [
    {
      title: "1. Event Overview",
      content:
        "Amader Barir Pujo is a community initiative based in Pune. We are offering bhog coupons for Saptami, Ashtami, and Nabami during Durga Pujo 2026 (October 15 to October 20, 2026).",
    },
    {
      title: "2. Coupon Booking & Payment",
      list: [
        "Bhog coupons are available for purchase online through our website.",
        "Payments must be made using our secure payment gateway (e.g., Razorpay or UPI).",
        "Upon successful payment, you will receive a confirmation via email or WhatsApp.",
      ],
    },
    {
      title: "3. No Refund Policy",
      content:
        "Once booked, bhog coupons are non-refundable and non-transferable. Please refer to our Refund Policy for detailed terms.",
    },
    {
      title: "4. Event Participation",
      list: [
        "Coupons are valid only for the specified date and meal mentioned at the time of booking.",
        "Entry for bhog distribution is subject to verification and may require ID or booking confirmation.",
        "Misuse or duplication of coupons may lead to cancellation without refund.",
      ],
    },
    {
      title: "5. Liability Disclaimer",
      list: [
        "We are not liable for delays, cancellations, or changes in schedule due to unforeseen circumstances (e.g., weather, civic disruptions, etc.).",
        "We do not guarantee availability of seating or bhog beyond your specified slot. Please be punctual.",
      ],
    },
    {
      title: "6. Code of Conduct",
      content:
        "We expect all participants to maintain decorum and follow instructions from volunteers. Any inappropriate behavior may result in denial of service without refund.",
    },
    {
      title: "7. Intellectual Property",
      content:
        "All content, logos, designs, and branding used on this site are the property of Pro Plus Data Foundation or its licensors and may not be copied or reproduced without permission.",
    },
    {
      title: "8. Privacy",
      content:
        "Please refer to our Privacy Policy to understand how we collect and manage your data.",
    },
    {
      title: "9. Amendments",
      content:
        "We reserve the right to modify these terms at any time. Continued use of the site after updates implies acceptance of the new terms.",
    },
    {
      title: "10. Contact Information",
      content: "For support, please contact:",
      list: [
        <span>
          Email:{" "}
          <a
            href="mailto:info@abp.proplusdatafoundation.com"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            info@abp.proplusdatafoundation.com
          </a>
        </span>,
        <span>
          Phone:{" "}
          <a
            href="tel:987987930302"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            987-987-930-302
          </a>
        </span>,
        "Address: Wakad, Pune, Pimpri-Chinchwad, Maharashtra 411057",
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Terms & Conditions | Amader Barir Pujo"
        description="Read our terms and conditions for bhog booking and event participation at Amader Barir Pujo 2026."
        keywords="Terms and Conditions, Amader Barir Pujo, Bhog Booking Terms"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/terms-and-conditions"
      />

      <LegalContent
        title="Terms & Conditions"
        subtitle="Welcome to Amader Barir Pujo, organized by Pro Plus Data Foundation and accessible at www.abp.proplusdatafoundation.com. By accessing or using this website and/or purchasing bhog coupons, you agree to be bound by the following Terms and Conditions:"
        effectiveDate="April 04, 2025"
        sections={sections}
      />
    </>
  );
};

export default TermsAndConditions;
