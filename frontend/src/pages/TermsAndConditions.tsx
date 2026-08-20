import React from "react";
import LegalContent from "../components/ui/LegalContent";
import SEO from "../components/ui/SEO";

const TermsAndConditions: React.FC = () => {
  const sections = [
    {
      title: "1. About Us",
      content:
        "Amader Bari'r Pujo® is a registered non-profit organization dedicated to celebrating Durga Puja, preserving Bengali culture and traditions, and fostering community engagement through cultural, religious, and social initiatives.",
    },
    {
      title: "2. Acceptance of Terms",
      content:
        "Your continued use of this website constitutes your acceptance of these Terms & Conditions, our Privacy Policy, and any additional guidelines applicable to specific services, events, or registrations.",
    },
    {
      title: "3. Website Usage",
      content: "You agree to use this website responsibly and only for lawful purposes. You shall not:",
      list: [
        "Attempt to gain unauthorized access to our systems.",
        "Disrupt or interfere with the operation of the website.",
        "Upload malicious software or harmful content.",
        "Misuse any information published on this website.",
      ],
    },
    {
      title: "4. Memberships, Registrations & Participation",
      content: [
        "Participation in cultural programs, competitions, volunteering opportunities, booth registrations, or other activities may require prior registration.",
        "Submission of a registration does not automatically guarantee participation unless confirmed by the organizing committee.",
        "The committee reserves the right to accept, decline, modify, or cancel registrations where necessary for operational, safety, or administrative reasons.",
        <br key="br1" />,
        <strong key="s1">Membership Fee Notice</strong>,
        "Amader Bari'r Pujo® does not charge any membership fee. If any individual or third party requests payment claiming it is a membership fee on our behalf, please do not make the payment. Amader Bari'r Pujo® shall not be responsible for any such unauthorized transactions. If you receive such a request, we encourage you to report it to us immediately through our official contact channels.",
      ],
    },
    {
      title: "5. Donations & Payments",
      content: "Our website may accept payments for:",
      list: [
        "Event registrations",
        "Sponsorships",
        "Donations",
        "Merchandise",
        "Stall bookings",
        "Other community initiatives",
      ],
    },
    {
      title: "",
      content: "By making a payment, you confirm that:",
      list: [
        "The information provided is complete and accurate.",
        "You are authorized to use the selected payment method.",
        "You understand the purpose of your payment.",
      ],
    },
    {
      title: "",
      content: "Unless specifically stated otherwise, donations are considered voluntary contributions supporting the activities of the organization."
    },
    {
      title: "6. Refund & Cancellation Policy",
      content: "Unless expressly mentioned for a particular event or service:",
      list: [
        "Donations are non-refundable.",
        "Booth registration payments are non-refundable once confirmed.",
        "If Amader Bari'r Pujo® cancels an event for reasons within its control, refund decisions will be communicated separately.",
      ],
    },
    {
      title: "7. Payment Security",
      list: [
        "Online payments are processed through trusted third-party payment gateways using industry-standard security practices.",
        "Amader Bari'r Pujo® does not collect or store your complete credit card, debit card, banking, or UPI credentials.",
      ],
    },
    {
      title: "8. Photography & Media",
      content: [
        "Photographs, videos, and recordings may be captured during events for documentation, promotional materials, social media, historical archives, and community communications.",
        "By attending our events, you consent to the use of such media where permitted by applicable law. If you have concerns regarding identifiable photographs, please contact the organizing committee.",
      ],
    },
    {
      title: "9. Intellectual Property",
      content: "Unless otherwise stated, all website content, including:",
      list: [
        "Logos",
        "Artwork",
        "Event branding",
        "Photographs",
        "Videos",
        "Designs",
        "Graphics",
        "Written content",
      ],
    },
    {
      title: "",
      content: [
        "is the intellectual property of Amader Bari'r Pujo® or is used under appropriate permission.",
        "No material may be copied, reproduced, modified, republished, or commercially exploited without prior written consent.",
      ],
    },
    {
      title: "10. Third-Party Services",
      content: [
        "This website may contain links to third-party websites or payment providers.",
        "We are not responsible for the content, availability, privacy practices, or security of external websites or services.",
      ],
    },
    {
      title: "11. Code of Conduct",
      content: "We strive to maintain a respectful, inclusive, and family-friendly environment. Visitors, participants, volunteers, sponsors, and members are expected to:",
      list: [
        "Treat everyone with courtesy and respect.",
        "Follow venue safety guidelines.",
        "Respect religious sentiments and cultural traditions.",
        "Refrain from harassment, discrimination, or disruptive behaviour.",
      ],
    },
    {
      title: "",
      content: "The organizing committee reserves the right to deny participation or request any individual to leave the premises if their conduct compromises the safety or experience of others."
    },
    {
      title: "12. Limitation of Liability",
      content: "While every reasonable effort is made to ensure a safe and enjoyable experience, Amader Bari'r Pujo®, its office bearers, volunteers, partners, sponsors, and organizing committee shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from:",
      list: [
        "Use of this website",
        "Participation in events",
        "Payment transactions",
        "Event schedule changes",
        "Technical interruptions",
        "Circumstances beyond our reasonable control",
      ],
    },
    {
      title: "",
      content: "Nothing in these Terms excludes liability where such exclusion is prohibited under applicable law."
    },
    {
      title: "13. Force Majeure",
      content:
        "Amader Bari'r Pujo® shall not be held responsible for delays, cancellations, or changes resulting from events beyond its reasonable control, including but not limited to natural disasters, severe weather, government restrictions, public health emergencies, power failures, strikes, or other unforeseen circumstances.",
    },
    {
      title: "14. Privacy",
      content: [
        "Your personal information is handled in accordance with our Privacy Policy.",
        "We are committed to protecting your information and using it responsibly for registrations, communication, memberships, payments, and community engagement.",
      ],
    },
    {
      title: "15. Governing Law",
      content: [
        "These Terms & Conditions shall be governed by and construed in accordance with the laws of India.",
        "Any disputes arising from the use of this website or participation in Amader Bari'r Pujo® activities shall be subject to the exclusive jurisdiction of the competent courts in Pune, Maharashtra, unless otherwise required by applicable law.",
      ],
    },
    {
      title: "16. Changes to These Terms",
      content: [
        "We reserve the right to update these Terms & Conditions at any time.",
        "Revisions become effective immediately upon publication on this website. Continued use of the website constitutes acceptance of the updated Terms.",
      ],
    },
    {
      title: "17. Contact Us",
      content: [
        "For questions regarding these Terms & Conditions, registrations, donations, or payments, please contact the Amader Bari'r Pujo® Organizing Committee using the contact information provided on this website.",
        <br key="br2" />,
        <strong key="s1">For any queries or for more information, please contact us at </strong>,
        <a key="email" href="mailto:info@abp.proplusdatafoundation.com" className="text-blue-600 hover:text-blue-700 underline">info@abp.proplusdatafoundation.com</a>,
        <br key="br3" />,
        "Thank you for supporting Amader Bari'r Pujo®. Together, we celebrate culture, community, and traditions that continue to bring us all closer.",
      ],
    },
  ];

  return (
    <div className="relative">
      <SEO
        title="Terms & Conditions | Amader Bari'r Pujo"
        description="Read our terms and conditions for Amader Bari'r Pujo® events, services, and participation."
        keywords="Terms and Conditions, Amader Bari'r Pujo, Rules, Regulations"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/terms-and-conditions"
      />

      <LegalContent
        title="Terms & Conditions"
        subtitle="A ProPlus Data Foundation Initiative. Welcome to the Amader Bari'r Pujo® website. By accessing or using this website, registering for an event, making a payment, or participating in any activity organized by Amader Bari'r Pujo®, you agree to these Terms & Conditions."
        effectiveDate="August 04, 2025"
        sections={sections}
      />
    </div>
  );
};

export default TermsAndConditions;
