'use client';

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

export default function FloatingBackground() {
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  const spinRange = prefersReducedMotion ? [0, 0] : [0, 480];
  const dashOffsetRange = prefersReducedMotion ? [0, 0] : [0, -620];

  const spin = useTransform(scrollYProgress, [0, 1], spinRange);
  const spinSpring = useSpring(spin, { stiffness: 55, damping: 22, mass: 0.7 });

  const highlightOffset = useTransform(scrollYProgress, [0, 1], dashOffsetRange);
  const highlightOffsetSpring = useSpring(highlightOffset, { stiffness: 90, damping: 26, mass: 0.7 });

  return (
    <div className="floating-backdrop" aria-hidden="true">
      <motion.div
        className="floating-backdrop__glow"
        animate={
          prefersReducedMotion
            ? { opacity: 0.78, scale: 1 }
            : { opacity: [0.55, 0.9, 0.55], scale: [0.92, 1.06, 0.92] }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 18, repeat: Infinity, ease: 'easeInOut' }
        }
      />

      <motion.svg
        className="floating-backdrop__record"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="beatproofRecordBase" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="rgba(10, 10, 14, 0.85)" />
            <stop offset="40%" stopColor="rgba(24, 21, 14, 0.78)" />
            <stop offset="78%" stopColor="rgba(236, 192, 66, 0.28)" />
            <stop offset="100%" stopColor="rgba(10, 10, 12, 0.04)" />
          </radialGradient>
          <linearGradient id="beatproofGroove" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(236, 192, 66, 0.32)" />
            <stop offset="100%" stopColor="rgba(236, 192, 66, 0.1)" />
          </linearGradient>
          <linearGradient id="beatproofHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f9e6aa" />
            <stop offset="40%" stopColor="#f0c052" />
            <stop offset="100%" stopColor="#b97d2e" />
          </linearGradient>
        </defs>

        <circle cx="200" cy="200" r="182" fill="none" stroke="rgba(236, 192, 66, 0.16)" strokeWidth="2" />
        <circle cx="200" cy="200" r="168" fill="url(#beatproofRecordBase)" />
        <circle cx="200" cy="200" r="130" fill="none" stroke="url(#beatproofGroove)" strokeWidth="3" />
        <circle cx="200" cy="200" r="98" fill="none" stroke="url(#beatproofGroove)" strokeWidth="2.2" />
        <circle cx="200" cy="200" r="68" fill="none" stroke="url(#beatproofGroove)" strokeWidth="1.8" />
        <circle cx="200" cy="200" r="36" fill="rgba(8, 9, 12, 0.68)" stroke="rgba(236, 192, 66, 0.2)" strokeWidth="3" />
        <circle cx="200" cy="200" r="14" fill="rgba(236, 192, 66, 0.88)" />

        <motion.circle
          cx="200"
          cy="200"
          r="146"
          fill="none"
          stroke="url(#beatproofHighlight)"
          strokeWidth="12"
          strokeDasharray="180 780"
          strokeLinecap="round"
          style={{
            rotate: spinSpring,
            originX: '50%',
            originY: '50%',
            strokeDashoffset: highlightOffsetSpring,
          }}
          opacity={0.9}
        />

        <motion.circle
          cx="200"
          cy="200"
          r="110"
          fill="none"
          stroke="url(#beatproofHighlight)"
          strokeWidth="8"
          strokeDasharray="130 620"
          strokeLinecap="round"
          style={{
            rotate: spinSpring,
            originX: '50%',
            originY: '50%',
            strokeDashoffset: highlightOffsetSpring,
          }}
          opacity={0.72}
        />
      </motion.svg>

      <motion.div
        className="floating-backdrop__spark"
        animate={
          prefersReducedMotion
            ? { scale: 1, opacity: 0.52 }
            : { scale: [0.95, 1.05, 0.95], opacity: [0.4, 0.82, 0.4] }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 20, repeat: Infinity, ease: 'easeInOut' }
        }
      />
    </div>
  );
}
