import React from "react";
import LegalContent from "../components/ui/LegalContent";
import SEO from "../components/ui/SEO";

const DataDeletionInstructions: React.FC = () => {
  const sections = [
    {
      title: "1. Introduction",
      content:
        "Users can request deletion of personal information associated with their interactions with Amader Barir Pujo / Proplus Data Foundation. This page explains how to submit a deletion request and what to expect during the process.",
    },
    {
      title: "2. What Data May Be Deleted",
      content: "A deletion request may cover personal information collected through the website, such as:",
      list: [
        "Name",
        "Email address",
        "Phone number",
        "Booking/payment-related personal information",
        "WhatsApp number used for communication",
        "Other personally identifiable information associated with the user's request",
      ],
    },
    {
      title: "",
      content: "Please note that certain financial transaction records may need to be retained for legal, accounting, fraud-prevention, or payment-processing requirements and may not be eligible for deletion.",
    },
    {
      title: "3. How to Request Data Deletion",
      content: "Users should send a deletion request to:",
      list: [
        <strong key="email">info@proplusdatafoundation.com</strong>,
      ],
    },
    {
      title: "",
      content: "The request should include:",
      list: [
        "Full name",
        "Email address used on the website",
        "Phone number used during the booking or interaction",
        "A clear statement requesting deletion of their personal data",
      ],
    },
    {
      title: "4. Verification",
      content:
        "Reasonable verification may be required before processing a deletion request to ensure that the request is coming from the person associated with the data. This helps protect user privacy and prevent unauthorized deletion requests.",
    },
    {
      title: "5. Processing",
      content:
        "Requests will be reviewed and processed within a reasonable period, subject to applicable legal, regulatory, accounting, security, fraud-prevention, and payment-record retention requirements.",
    },
    {
      title: "6. Confirmation",
      content:
        "Once the deletion request has been processed, the user will receive confirmation where appropriate. If any information cannot be deleted due to legal or operational requirements, we will explain the reasons in our response.",
    },
    {
      title: "7. Contact",
      content: [
        "Proplus Data Foundation",
        <br key="br1" />,
        <strong key="s1">For any queries about data deletion, please contact us at </strong>,
        <a key="email" href="mailto:info@proplusdatafoundation.com" className="text-blue-600 hover:text-blue-700 underline">info@proplusdatafoundation.com</a>,
      ],
    },
  ];

  return (
    <div className="relative">
      <SEO
        title="Data Deletion Instructions | Amader Barir Pujo"
        description="Learn how to request deletion of your personal information from Amader Barir Pujo / Proplus Data Foundation."
        keywords="Data Deletion, Privacy, GDPR, Amader Barir Pujo, Proplus Data Foundation"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://abp.proplusdatafoundation.com/data-deletion"
      />

      <LegalContent
        title="Data Deletion Instructions"
        subtitle="This page provides instructions for users who wish to request deletion of their personal information from Amader Barir Pujo / Proplus Data Foundation systems."
        effectiveDate="September 17, 2026"
        sections={sections}
      />
    </div>
  );
};

export default DataDeletionInstructions;
