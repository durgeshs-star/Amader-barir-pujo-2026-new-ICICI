import React from "react";
import LegalContent from "../components/ui/LegalContent";
import SEO from "../components/ui/SEO";

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      title: "1. Personal Information",
      content: "We collect personal information that you provide directly to us when you engage with our Services, including:",
      list: [
        "Name",
        "Email Address",
        "Phone Number",
        "Address",
        "Other information relevant to our Services",
      ],
    },
    {
      title: "2. Automatically Collected Information",
      content: [
        "When you use our Services or visit our website, we automatically collect certain information, including:",
      ],
      list: [
        "IP address",
        "Device and browser type",
        "Operating system",
        "Referring URLs",
        "Pages visited",
        "Date and time of access",
        "Other browsing activities",
      ],
    },
    {
      title: "3. How We Use Your Information",
      content: [
        "This information helps us enhance our Services and improve your experience. If you choose to share your information with us, we may use it to:"
      ],
      list: [
        <span><strong>Event Registration:</strong> Process registrations for cultural programs, competitions, volunteering, or other Pujo activities.</span>,
        <span><strong>Communication:</strong> Share important updates about the event, schedules, announcements, or changes related to Amar Barir Pujo.</span>,
        <span><strong>Community Engagement:</strong> Respond to your queries, feedback, or requests, and help you stay connected with our community.</span>,
        <span><strong>Photography & Media:</strong> With appropriate permissions where required, use photographs or videos captured during the event for promotional, archival, or community communication purposes.</span>,
        <span><strong>Website Improvement:</strong> Understand how visitors use our website so we can improve its content, accessibility, and overall experience.</span>,
        <span><strong>Safety & Compliance:</strong> Fulfill legal obligations, protect the security of our website and visitors, and enforce our terms and policies.</span>,
      ]
    },
    {
      title: "",
      content: "*We do not sell personal information to third parties."
    },
    {
      title: "4. Data Security",
      content:
        "We take appropriate security measures to protect your information from unauthorized access, disclosure, alteration, or destruction. However, no security system is completely foolproof, and we cannot guarantee the absolute security of your information.",
    },
    {
      title: "5. Your Choices and Rights",
      content: "You have rights regarding your personal information, including:",
      list: [
        "Accessing, correcting, or deleting your information.",
        "Opting out of marketing communications.",
        "Restricting or objecting to certain data processing activities.",
        "Withdrawing consent where applicable.",
      ],
    },
    {
      title: "6. Cookies and Tracking Technologies",
      content:
        "We use cookies and similar technologies to enhance your experience on our website. You can control cookies through your browser settings, but disabling cookies may limit your use of certain features.",
    },
    {
      title: "7. Third-Party Websites",
      content:
        "Our website may contain links to third-party sites. We are not responsible for their privacy practices or content of these sites. Please review their privacy policies before providing any personal information.",
    },
    {
      title: "8. Changes to This Privacy Policy",
      content:
        "We may update this Privacy Policy to reflect changes in our practices or legal requirements. Any changes will be posted on this page, and the effective date will be updated accordingly. We encourage you to review this policy periodically.",
    },
    {
      title: "9. Contact Us",
      content: [
        "To exercise these rights, or for questions or concerns about this Privacy Policy, please contact us at:",
        <span>Royal Oak Society Rd, Karpe Nagar, Kemse Vasti, Wakad, Pimpri-Chinchwad, Maharashtra 411057</span>,
        <span><a href="mailto:info@proplusdata.co" className="text-blue-600 hover:text-blue-700 underline">info@proplusdata.co</a></span>,
        <span><a href="mailto:info@abp.proplusdatafoundation.co" className="text-blue-600 hover:text-blue-700 underline">info@abp.proplusdatafoundation.co</a></span>
      ]
    }
  ];

  return (
    <>
      <SEO
        title="Privacy Policy | Amader Barir Pujo"
        description="Learn how Amader Barir Pujo and ProPlus Data collects, uses, and protects your personal data when you use our website or services."
        keywords="Privacy Policy, Data Protection, Amader Barir Pujo, ProPlus Data"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/privacy-policy"
      />

      <LegalContent
        title="Privacy Policy"
        subtitle={<>ProPlus Data (<a href="https://proplusdatafoundation.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#dc2626', textDecoration: 'underline' }}>https://proplusdatafoundation.com</a>) ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and protect your information when you use our services, which include Contact Discovery, Technographics, Email Data Management (EDM), Demand Generation, and other related services ("Services"). By using our Services, you agree to the collection and use of your information as described in this policy.</>}
        effectiveDate="August 04, 2025"
        sections={sections}
      />
    </>
  );
};

export default PrivacyPolicy;
