import React, { useState } from 'react';
import SEO from '../components/ui/SEO';
import Button from '../components/ui/Button';

export const Anudan: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    txId: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contribution Details Submitted:', formData);
    setSubmitted(true);
  };

  const contributionTiers = [
    { name: 'Anjali Sponsor', amount: 'â‚¹1,100', perk: 'Special sankalpa on Maha Ashtami' },
    { name: 'Bhog Sponsor', amount: 'â‚¹2,500', perk: 'Prasad served with special arrangements' },
    { name: 'Pandal Patron', amount: 'â‚¹5,100', perk: 'Maa Durga blessings certificate & VIP access' },
    { name: 'Pujo Partner', amount: 'â‚¹11,000+', perk: 'Name displayed on sponsor board & VIP family pass' },
  ];

  return (
    <div className="pt-10 md:pt-14 pb-20 bg-light-bg/30 min-h-screen">
      <SEO title="Anudan &amp; Contributions" description="Support Amader Barir Pujo with your contribution. Sponsor Bhog, pandal, or cultural programs for Durga Puja 2026 in Wakad, Pune." keywords="Donate Durga Puja Pune, Anudan Amader Barir Pujo, sponsor Durga Puja 2026" />
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-950 font-fraunces mb-3">
            Anudan &amp; Contributions
          </h1>
          <p className="text-sm text-gray-500 font-medium font-sans">
            Support the Durga Pujo celebrations. Every contribution helps serve the devotees.
          </p>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Tiers and Bank Info */}
          <div className="lg:col-span-2 space-y-10">
            {/* Tiers Grid */}
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold font-fraunces text-primary">Sponsorship Tiers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contributionTiers.map((tier, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-accent hover:shadow-lg transition-all duration-300">
                    <h3 className="text-base font-bold text-gray-900 font-fraunces">{tier.name}</h3>
                    <div className="text-2xl font-bold text-primary font-fraunces mt-1">{tier.amount}</div>
                    <p className="text-xs text-gray-500 leading-relaxed mt-2">&bull; {tier.perk}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank details */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4 select-text">
              <h2 className="text-xl font-bold font-fraunces text-primary">Bank Transfer Details</h2>
              <p className="text-xs text-gray-500">You can transfer directly to our bank account. Please note down transaction ID to submit the form.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-sans pt-2">
                <div className="p-3.5 bg-light-bg rounded-lg border border-gray-150">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Account Name</span>
                  <div className="font-semibold text-gray-800 mt-0.5">Amader Barir Pujo Foundation</div>
                </div>
                <div className="p-3.5 bg-light-bg rounded-lg border border-gray-150">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Bank Name</span>
                  <div className="font-semibold text-gray-800 mt-0.5">HDFC Bank Ltd.</div>
                </div>
                <div className="p-3.5 bg-light-bg rounded-lg border border-gray-150">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Account Number</span>
                  <div className="font-semibold text-gray-800 mt-0.5">50100234567890</div>
                </div>
                <div className="p-3.5 bg-light-bg rounded-lg border border-gray-150">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">IFSC Code</span>
                  <div className="font-semibold text-gray-800 mt-0.5">HDFC0001234</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: QR and confirmation form */}
          <div className="space-y-8">
            {/* QR Mockup */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 text-center shadow-sm flex flex-col items-center">
              <h2 className="text-lg font-bold font-fraunces text-primary mb-3">UPI QR Code</h2>
              <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-250 flex items-center justify-center rounded-lg relative overflow-hidden">
                {/* Fallback stylized QR mockup */}
                <div className="absolute inset-4 bg-white border border-gray-200 flex flex-col justify-center items-center text-gray-300">
                  <div className="w-6 h-6 border-4 border-gray-800 self-start m-1 rounded-sm" />
                  <div className="w-6 h-6 border-4 border-gray-800 self-end m-1 rounded-sm" />
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Scan to Pay</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-4">
                Scan using any UPI App (GPay, PhonePe, Paytm) to make contribution directly.
              </p>
            </div>

            {/* Confirmation form */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold font-fraunces text-primary mb-4">Notify Us of Transfer</h2>
              
              {submitted ? (
                <div className="text-center py-6 space-y-3 animate-fade-in">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 font-bold text-xl">
                    âœ“
                  </div>
                  <h3 className="text-lg font-bold font-fraunces text-primary">Details Received</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Thank you for your generous contribution. We will verify the transaction details and email you the receipt. Joy Maa Durga!
                  </p>
                  <button onClick={() => setSubmitted(false)} className="text-xs text-accent hover:underline bg-transparent border-0 cursor-pointer">
                    Submit another notification
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="tx-name" className="text-[10px] font-bold text-gray-550 uppercase tracking-widest">Name</label>
                    <input
                      id="tx-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="px-3 py-2 border border-gray-200 text-xs rounded focus:outline-none focus:border-primary"
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="tx-phone" className="text-[10px] font-bold text-gray-550 uppercase tracking-widest">Phone</label>
                    <input
                      id="tx-phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="px-3 py-2 border border-gray-200 text-xs rounded focus:outline-none focus:border-primary"
                      placeholder="Enter phone"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="tx-amount" className="text-[10px] font-bold text-gray-550 uppercase tracking-widest">Amount Paid</label>
                    <input
                      id="tx-amount"
                      type="number"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="px-3 py-2 border border-gray-200 text-xs rounded focus:outline-none focus:border-primary"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="tx-txid" className="text-[10px] font-bold text-gray-550 uppercase tracking-widest">Transaction / Ref ID</label>
                    <input
                      id="tx-txid"
                      type="text"
                      required
                      value={formData.txId}
                      onChange={(e) => setFormData({ ...formData, txId: e.target.value })}
                      className="px-3 py-2 border border-gray-200 text-xs rounded focus:outline-none focus:border-primary"
                      placeholder="Enter transaction id"
                    />
                  </div>
                  <Button type="submit" variant="primary" fullWidth className="py-2 text-xs">
                    Submit Details
                  </Button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Anudan;


