import { motion } from 'framer-motion';
import NavBar from '../components/NavBar.jsx';
import LandingHero from '../components/LandingHero.jsx';

const LandingPage = ({ onDevExplore }) => (
  <motion.main
    key="landing-view"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ duration: 0.55, ease: 'easeOut' }}
    style={{ display: 'grid', gap: '2.5rem' }}
  >
    <NavBar />
    <LandingHero onDevExplore={onDevExplore} />
  </motion.main>
);

export default LandingPage;
