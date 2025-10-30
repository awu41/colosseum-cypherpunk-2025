import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnimatePresence } from 'framer-motion';
import FloatingBackground from './components/FloatingBackground.jsx';
import LandingPage from './pages/LandingPage.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';

const App = () => {
  const { connected } = useWallet();
  const [activeView, setActiveView] = useState('landing');

  useEffect(() => {
    setActiveView(connected ? 'marketplace' : 'landing');
  }, [connected]);

  return (
    <div className="app-shell">
      <FloatingBackground />
      <div className="content-layer">
        <AnimatePresence mode="wait">
          {activeView === 'landing' ? (
            <LandingPage key="landing" />
          ) : (
            <MarketplacePage key="marketplace" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
