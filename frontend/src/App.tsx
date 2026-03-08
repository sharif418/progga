import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'sonner';

function App() {
    return (
        <Router>
            <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
                <Navbar />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                </main>
                <Footer />
                <Toaster richColors position="top-right" duration={5000} closeButton />
            </div>
        </Router>
    );
}

export default App;
