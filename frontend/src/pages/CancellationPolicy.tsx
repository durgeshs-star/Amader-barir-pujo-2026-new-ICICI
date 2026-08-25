import React from "react";
import LegalContent from "../components/ui/LegalContent";
import SEO from "../components/ui/SEO";

const CancellationPolicy: React.FC = () => {
  const sections = [
    {
      title: "1. Introduction",
      content: "This Cancellation Policy outlines the terms and conditions under which bookings, registrations, and services made through the Amader Barir Pujo (ABP) 2026 website may be cancelled. By making a booking or registration, you agree to abide by this policy.",
    },
    {
      title: "2. Cancellation of Bookings/Services",
      content: "Cancellations may apply to various services offered through our website, including but not limited to event registrations, bhog bookings, sponsorships, and other paid services. The specific cancellation terms for each service are outlined in this policy.",
    },
    {
      title: "3. Cancellation by the User",
      content: "If you wish to cancel a booking or registration, you must notify the ABP organizing committee through our official contact channels. Cancellation requests should be made as early as possible to allow for appropriate arrangements.",
    },
    {
      title: "",
      content: "Please note that certain services may have specific cancellation windows and conditions. Users are encouraged to review the details of their specific booking before proceeding with cancellation.",
    },
    {
      title: "4. Cancellation by the Organizers",
      content: "The ABP organizing committee reserves the right to cancel bookings, registrations, or services in certain circumstances, including but not limited to:",
      list: [
        "Non-compliance with event guidelines or code of conduct",
        "Providing false or misleading information during registration",
        "Operational or safety concerns",
        "Circumstances beyond our reasonable control",
      ],
    },
    {
      title: "",
      content: "In the event of a cancellation by the organizers, affected users will be notified through the contact information provided during registration.",
    },
    {
      title: "5. Event Cancellation or Postponement",
      content: "In the unlikely event that the entire Durga Puja celebration or specific events are cancelled or postponed due to circumstances beyond our control (including but not limited to natural disasters, government restrictions, public health emergencies, or force majeure events), the ABP organizing committee will communicate the impact on existing bookings and registrations.",
    },
    {
      title: "",
      content: "Decisions regarding refunds or rescheduling in such cases will be made at the discretion of the organizing committee and communicated to all affected participants.",
    },
    {
      title: "6. Communication Regarding Cancellation",
      content: "All cancellation requests and communications should be directed to the ABP organizing committee through our official contact channels. We recommend keeping records of all cancellation-related correspondence for your reference.",
    },
    {
      title: "7. Contact Information",
      content: [
        "For any questions regarding cancellations, or to request a cancellation, please contact us using the information provided below.",
        <br key="br1" />,
        <strong key="s1">For any queries or for more information, please contact us at </strong>,
        <a key="email" href="mailto:info@abp.proplusdatafoundation.com" className="text-blue-600 hover:text-blue-700 underline">info@abp.proplusdatafoundation.com</a>,
      ],
    },
  ];

  return (
    <div className="relative">
      <SEO 
        title="Cancellation Policy"
        description="Cancellation Policy for Amader Barir Pujo bookings, registrations, and services. Learn about our cancellation terms and conditions."
      />
      <LegalContent
        title="Cancellation Policy"
        subtitle="A ProPlus Data Foundation Initiative. This Cancellation Policy governs the cancellation of bookings, registrations, and services made through the Amader Barir Pujo (ABP) 2026 website."
        effectiveDate="August 20, 2026"
        sections={sections}
      />
    </div>
  );
};

export default CancellationPolicy;