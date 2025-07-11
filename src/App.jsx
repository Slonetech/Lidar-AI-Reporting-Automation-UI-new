import React, { useState } from 'react';
import { ThemeProvider } from './utils/ThemeContext';
import { ToastProvider } from './utils/ToastContext';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Scheduling from './components/Scheduling';
import Validation from './components/Validation';
import Audit from './components/Audit';
import AnalyticsPlaceholder from './components/Analytics';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [prevTab, setPrevTab] = useState('dashboard');
  const [animating, setAnimating] = useState(false);

  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      setPrevTab(activeTab);
      setAnimating(true);
      setTimeout(() => {
        setActiveTab(tab);
        setAnimating(false);
      }, 250); // match animation duration
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return <AnalyticsPlaceholder />;
      case 'reports':
        return <Reports />;
      case 'scheduling':
        return <Scheduling />;
      case 'validation':
        return <Validation />;
      case 'audit':
        return <Audit />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background text-text-primary transition-colors duration-300">
          <div className="flex">
            {/* Sidebar Navigation */}
            <Navigation activeTab={activeTab} setActiveTab={handleTabChange} />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 p-6 overflow-auto">
                <div className="max-w-7xl mx-auto space-y-6 relative min-h-[400px]">
                  <div className={`transition-all duration-300 ${animating ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`} key={activeTab} aria-live="polite">
                    {renderContent()}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
