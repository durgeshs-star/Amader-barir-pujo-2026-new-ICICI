import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout & UI Global features
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import WhatsAppBtn from './components/Sections/WhatsAppBtn';
import BackToTop from './components/Sections/BackToTop';

// Page Views
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Volunteer from './pages/Volunteer';
import Schedule from './pages/Schedule';
import Anudan from './pages/Anudan';
import BhogBooking from './pages/BhogBooking';
import Gallery from './pages/Gallery';
import ContactUs from './pages/ContactUs';
import Legal from './pages/Legal';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-light-bg/10 relative">
        {/* Navigation Header */}
        <Header />

        {/* Core Page Router Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/volunteer" element={<Volunteer />} />
            
            {/* Day specific schedule paths */}
            <Route path="/pujo-schedule/:day" element={<Schedule />} />
            {/* Fallback schedule page */}
            <Route path="/pujo-schedule" element={<Schedule />} />
            
            <Route path="/anudan" element={<Anudan />} />
            
            {/* Day specific bhog booking paths */}
            <Route path="/bhog-booking/:day" element={<BhogBooking />} />
            {/* Fallback bhog booking page */}
            <Route path="/bhog-booking" element={<BhogBooking />} />
            
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact-us" element={<ContactUs />} />
            
            {/* Legal policies */}
            <Route path="/terms-and-conditions" element={<Legal />} />
            <Route path="/privacy-policy" element={<Legal />} />
            
            {/* Fallback redirect or homepage display */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Footer info bar */}
        <Footer />

        {/* Global floating action widgets */}
        <WhatsAppBtn />
        <BackToTop />
      </div>
    </BrowserRouter>
  );
};

export default App;