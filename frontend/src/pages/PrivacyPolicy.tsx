import React from "react";
import LegalContent from "../components/ui/LegalContent";
import SEO from "../components/ui/SEO";

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      title: "1. Information We Collect",
      content: "We may collect",
      list: [
        "Your name, contact number, and email",
        "Payment details (via secure third-party payment gateways)",
        "Booking details for bhog coupons",
        "Technical information like IP address and device/browser type (for analytics and security)",
      ],
    },
    {
      title: "2. Why We Collect It",
      content: "Your information is used to:",
      list: [
        "Confirm your bhog coupon booking",
        "Send you transaction or event updates",
        "Respond to your queries or support requests",
        "Analyze engagement to improve our services",
      ],
    },
    {
      title: "3. Data Security",
      content:
        "We use industry-standard security measures to protect your data. However, since no online transmission is completely secure, we encourage you to take reasonable precautions as well.",
    },
    {
      title: "4. Sharing of Data",
      content:
        "We do not sell or share your personal information with third parties for marketing. Data may be shared only with:",
      list: [
        "Our secure payment gateway partners",
        "Volunteers or support staff for event-related coordination",
      ],
    },
    {
      title: "5. Your Rights",
      content: "You can",
      list: [
        "Request access to your data",
        "Request correction or deletion (subject to legal requirements)",
        <span>
          Contact us at{" "}
          <a
            href="mailto:support@amaderbarirpujo.com"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            support@amaderbarirpujo.com
          </a>{" "}
          for any privacy concerns
        </span>,
      ],
    },
    {
      title: "6. Policy Updates",
      content:
        "This policy may change. All updates will be posted on this page with the effective date revised.",
    },
  ];

  return (
    <>
      <SEO
        title="Privacy Policy | Amader Barir Pujo"
        description="Learn how Amader Barir Pujo collects, uses, and protects your personal data when you use our website or book bhog."
        keywords="Privacy Policy, Data Protection, Amader Barir Pujo"
        ogImage="/assets/img/banner/1.webp"
      />

      <LegalContent
        title="Privacy Policy"
        subtitle="At Amader Barir Pujo, a community initiative under the Pro Plus Data Foundation, we respect your privacy and are committed to protecting your personal data. This policy explains how your information is collected, used, and safeguarded when you visit or transact on www.abp.proplusdatafoundation.com."
        effectiveDate="August 04, 2025"
        sections={sections}
      />
    </>
  );
};

export default PrivacyPolicy;
