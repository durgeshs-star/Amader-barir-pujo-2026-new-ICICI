import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout & UI Global features — always eager (above the fold)
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
// import WhatsAppBtn from './components/Sections/WhatsAppBtn';
import BackToTop from './components/Sections/BackToTop';
import FulachiMal from './components/Sections/FulachiMal';
// import Preloader from './components/ui/Preloader';

const Home = lazy(() => import('./pages/Home'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Volunteer = lazy(() => import('./pages/Volunteer'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Anudan = lazy(() => import('./pages/Anudan'));
const BhogBooking = lazy(() => import('./pages/BhogBooking'));
const Gallery = lazy(() => import('./pages/Gallery'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const News = lazy(() => import('./pages/News'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const PanchamiPage = lazy(() => import('./pages/Panchami/PanchamiPage'));
const ShashtiPage = lazy(() => import('./pages/Shashti/ShashtiPage'));
const SaptamiPage = lazy(() => import('./pages/Saptami/SaptamiPage'));
const AshtamiPage = lazy(() => import('./pages/Ashtami/AshtamiPage'));
const AshtamiSandhiPujaPage = lazy(() => import('./pages/AshtamiSandhiPuja/AshtamiSandhiPujaPage'));
const NavamiPage = lazy(() => import('./pages/Navami/NavamiPage'));
const DashamiPage = lazy(() => import('./pages/Dashami/DashamiPage'));
const SaptamiBhogPage = lazy(() => import('./pages/SaptamiBhog/SaptamiBhogPage'));
const AshtamiBhogPage = lazy(() => import('./pages/AshtamiBhog/AshtamiBhogPage'));
const AshtamiBhogSandhiPujaPage = lazy(() => import('./pages/AshtamiBhogSandhiPuja/AshtamiBhogSandhiPujaPage'));
const NavamiBhogPage = lazy(() => import('./pages/NavamiBhog/NavamiBhogPage'));
const DurgaPujaBhogPage = lazy(() => import('./pages/DurgaPujaBhog/DurgaPujaBhogPage'));
const LakshmiPujaBhogPage = lazy(() => import('./pages/LakshmiPujaBhog/LakshmiPujaBhogPage'));
const SaraswatiPujaBhogPage = lazy(() => import('./pages/SaraswatiPujaBhog/SaraswatiPujaBhogPage'));
const SaraswatiPuja = lazy(() => import('./pages/SaraswatiPuja'));
const MockPayment = lazy(() => import('./components/Payment/MockPayment'));
const PaymentSuccess = lazy(() => import('./components/Payment/PaymentSuccess'));
const PaymentFailure = lazy(() => import('./components/Payment/PaymentFailure'));
const PaymentPending = lazy(() => import('./components/Payment/PaymentPending'));
const Questionair = lazy(() => import('./pages/Questionair'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageSkeleton: React.FC = () => (
  <div
    style={{ minHeight: '60vh', backgroundColor: 'oklch(98.7% 0.022 95.277)' }}
    aria-hidden="true"
    role="status"
    aria-label="Loading page…"
  />
);

const AppShell: React.FC = () => {
  const location = useLocation();
  const isWelcomeToAbpWaFamilyRoute = location.pathname === '/welcome-to-abp-wa-family';
  const siteLive = (import.meta.env.VITE_SITE_LIVE || import.meta.env.REACT_APP_SITE_LIVE || 'false').toLowerCase() === 'false';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!siteLive && !isWelcomeToAbpWaFamilyRoute) {
    return <Navigate to="/welcome-to-abp-wa-family" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col relative bg-pattern-wrapper" style={{ backgroundColor: 'oklch(98.7% 0.022 95.277)' }}>
      {!isWelcomeToAbpWaFamilyRoute ? <Header /> : null}

      <main className="grow relative z-10 content-layer">
        {!isWelcomeToAbpWaFamilyRoute ? <FulachiMal /> : null}
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/welcome-to-abp-wa-family" element={<Questionair />} />

            {/* Day specific schedule paths */}
            <Route path="/pujo-schedule/:day" element={<Schedule />} />
            {/* Fallback schedule page */}
            <Route path="/pujo-schedule" element={<Schedule />} />

            {/* Day-specific pujo pages */}
            <Route path="/panchami" element={<PanchamiPage />} />
            <Route path="/shashti" element={<ShashtiPage />} />
            <Route path="/saptami" element={<SaptamiPage />} />
            <Route path="/ashtami" element={<AshtamiPage />} />
            <Route path="/ashtami-sandhi-puja" element={<AshtamiSandhiPujaPage />} />
            <Route path="/navami" element={<NavamiPage />} />
            <Route path="/dashami" element={<DashamiPage />} />

            <Route path="/anudan" element={<Anudan />} />
            <Route path="/saraswati-puja" element={<SaraswatiPuja />} />
            <Route path="/saraswati-puja-bhog" element={<SaraswatiPujaBhogPage />} />

            {/* Day specific bhog booking paths */}
            <Route path="/bhog-booking/saptami" element={<SaptamiBhogPage />} />
            <Route path="/bhog-booking/ashtami" element={<AshtamiBhogPage />} />
            <Route path="/bhog-booking/ashtami-sandhi-puja" element={<AshtamiBhogSandhiPujaPage />} />
            <Route path="/bhog-booking/navami" element={<NavamiBhogPage />} />
            <Route path="/bhog-booking/lakshmi-puja" element={<LakshmiPujaBhogPage />} />
            <Route path="/bhog-booking/saraswati-puja" element={<SaraswatiPujaBhogPage />} />
            <Route path="/durga-puja-bhog" element={<DurgaPujaBhogPage />} />
            <Route path="/bhog-booking/:day" element={<BhogBooking />} />
            {/* Fallback bhog booking page */}
            <Route path="/bhog-booking" element={<BhogBooking />} />

            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/news" element={<News />} />

            {/* Legal policies */}
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* Payment routes */}
            <Route path="/mock-payment/:transactionId" element={<MockPayment />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/payment/pending" element={<PaymentPending transactionId="" orderId="" amount={0} />} />

            {/* Fallback redirect or 404 display */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {!isWelcomeToAbpWaFamilyRoute ? <Footer /> : null}
      {/* {!isWelcomeToAbpWaFamilyRoute ? <WhatsAppBtn /> : null} */}
      {!isWelcomeToAbpWaFamilyRoute ? <BackToTop /> : null}
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="text-primary border border-gray-200 shadow-lg rounded-lg"
        progressClassName="bg-primary"
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
};

export default App;