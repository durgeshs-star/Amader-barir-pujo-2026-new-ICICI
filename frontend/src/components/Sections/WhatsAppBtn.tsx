import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

export const WhatsAppBtn: React.FC = () => {
  // Let the user modify their phone number here. 
  // Custom text message can also be appended.
  const whatsappNumber = '919879879302'; 
  const message = encodeURIComponent("Namaskar! I'd like to get in touch regarding Amader Barir Pujo 2026.");
  const waUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-[99] flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-green-400/50"
      title="Chat with us on WhatsApp"
      aria-label="Contact us on WhatsApp"
    >
      <FaWhatsapp size={30} />
      
      {/* Tooltip on Hover */}
      <span className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-200 origin-left bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-md whitespace-nowrap pointer-events-none select-none">
        Chat with us!
      </span>
    </a>
  );
};

export default WhatsAppBtn;
