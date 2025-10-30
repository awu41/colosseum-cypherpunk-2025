import { motion } from 'framer-motion';

const FloatingBackground = () => (
  <div className="floating-backdrop" aria-hidden="true">
    <motion.div
      className="floating-backdrop__glow"
      animate={{ opacity: [0.64, 0.92, 0.64], scale: [0.96, 1.05, 0.96] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="floating-backdrop__lines"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
    />
    <motion.div
      className="floating-backdrop__trail"
      animate={{ opacity: [0.25, 0.6, 0.25] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="floating-backdrop__orb"
      animate={{ y: [-12, 12, -12], filter: ['blur(0.4px)', 'blur(1px)', 'blur(0.4px)'] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

export default FloatingBackground;
