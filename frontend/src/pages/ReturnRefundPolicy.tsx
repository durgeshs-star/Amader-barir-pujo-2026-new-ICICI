import React from "react";
import LegalContent from "../components/ui/LegalContent";
import SEO from "../components/ui/SEO";

const ReturnRefundPolicy: React.FC = () => {
  const sections = [
    {
      title: "1. Introduction",
      content: "This Return & Refund Policy outlines the terms regarding payments, refunds, and returns for services, bookings, registrations, contributions, and donations made through the Amader Barir Pujo (ABP) 2026 website. Please read this policy carefully before making any payment.",
    },
    {
      title: "2. No Refund Policy",
      content: "There will be NO refund once a payment has been successfully completed. Payments made through the ABP 2026 website are considered final once successfully completed.",
    },
    {
      title: "",
      content: "No refund requests will normally be accepted after successful payment. No returns or refunds are provided for event-related bookings, registrations, contributions, donations, or services purchased through the website.",
    },
    {
      title: "3. Payment Confirmation",
      content: "Users should verify their booking/payment details carefully before completing the transaction. Once a payment is successfully processed and confirmed, it is considered final and binding.",
    },
    {
      title: "",
      content: "By proceeding with payment, you acknowledge that you have reviewed and understood the details of your booking and agree that the payment is non-refundable.",
    },
    {
      title: "4. Duplicate or Failed Transactions",
      content: "In case of a technical or payment issue, such as a duplicate transaction or an amount being debited without successful payment confirmation, the user may contact the organizers for verification.",
    },
    {
      title: "",
      content: "Such cases will be reviewed on a technical basis, and any resolution will be subject to verification by the organizers and/or the payment gateway. Please provide transaction details and any relevant documentation when reporting such issues.",
    },
    {
      title: "5. Event Cancellation/Postponement",
      content: "In the event that the Durga Puja celebration or specific events are cancelled or postponed due to circumstances beyond our control (including but not limited to natural disasters, government restrictions, public health emergencies, or force majeure events), decisions regarding any potential adjustments will be communicated separately.",
    },
    {
      title: "",
      content: "Any decisions in such cases will be at the discretion of the ABP organizing committee and will be communicated to all affected participants.",
    },
    {
      title: "6. Exceptions and Dispute Resolution",
      content: "The organizers reserve the right to review payment-related disputes on a case-by-case basis where technically necessary. Any exceptional resolution will be subject to verification by the organizers and/or the payment gateway provider.",
    },
    {
      title: "",
      content: "All decisions regarding exceptions to this policy are final and binding. The organizers are not obligated to provide refunds except in cases verified as technical payment errors.",
    },
    {
      title: "7. Contact Information",
      content: [
        "For any questions regarding payments, or to report technical payment issues, please contact us using the information provided below.",
        <br key="br1" />,
        <strong key="s1">For any queries or for more information, please contact us at </strong>,
        <a key="email" href="mailto:info@abp.proplusdatafoundation.com" className="text-blue-600 hover:text-blue-700 underline">info@abp.proplusdatafoundation.com</a>,
      ],
    },
  ];

  return (
    <div className="relative">
      <SEO 
        title="Return & Refund Policy"
        description="Return & Refund Policy for Amader Barir Puja payments, bookings, registrations, contributions, and donations. Learn about our no-refund policy."
      />
      <LegalContent
        title="Return & Refund Policy"
        subtitle="A ProPlus Data Foundation Initiative. This Return & Refund Policy governs all payments made through the Amader Barir Pujo (ABP) 2026 website."
        effectiveDate="August 20, 2026"
        sections={sections}
      />
    </div>
  );
};

export default ReturnRefundPolicy;