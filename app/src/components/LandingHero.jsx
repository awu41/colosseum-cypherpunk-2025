import { motion } from 'framer-motion';

const LandingHero = ({ onDevExplore }) => (
  <motion.section
    className="island island--frosted floating"
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }}
    aria-labelledby="hero-title"
  >
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, ease: 'easeOut', delay: 0.4 }}
    >
      <h1 className="headline" id="hero-title">
        Float into the sound of Solana.
      </h1>
      <p className="subheadline">
        Discover rare audio NFTs, unlock intimate artist experiences, and trade sonic moments secured on the
        Solana blockchain. Designed for explorers who crave immersive storytelling.
      </p>

      <div className="cta-row">
        <a className="primary-button" href="#marketplace" aria-label="View the marketplace section">
          Enter the Marketplace
        </a>
        <a className="ghost-button" href="#about" aria-label="Learn more about Beatproof">
          Learn More
        </a>
        {onDevExplore && (
          <button
            className="ghost-button ghost-button--dev"
            type="button"
            onClick={onDevExplore}
            aria-label="Preview the marketplace without connecting a wallet"
          >
            Dev Preview Marketplace
          </button>
        )}
      </div>
    </motion.div>

    <div className="section-frame" id="about">
      <div className="metrics-row">
        <motion.div
          className="metric-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.1, duration: 0.7, ease: 'easeOut' }}
        >
          <span className="metric-value">12.4k+</span>
          <span className="metric-label">Audio NFTs Minted</span>
          <p style={{ margin: 0, color: 'rgba(227, 229, 236, 0.52)', fontSize: '0.85rem' }}>
            Crafted by pioneers pushing the edges of Web3 music culture.
          </p>
        </motion.div>

        <motion.div
          className="metric-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
        >
          <span className="metric-value">2.8s</span>
          <span className="metric-label">Avg. Settlement</span>
          <p style={{ margin: 0, color: 'rgba(227, 229, 236, 0.52)', fontSize: '0.85rem' }}>
            Instant, low-fee trades powered by Solana&apos;s lightning network.
          </p>
        </motion.div>

        <motion.div
          className="metric-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
        >
          <span className="metric-value">360°</span>
          <span className="metric-label">Immersive Islands</span>
          <p style={{ margin: 0, color: 'rgba(227, 229, 236, 0.52)', fontSize: '0.85rem' }}>
            Designed for first-time collectors with cinematic UX and guided flows.
          </p>
        </motion.div>
      </div>
    </div>
  </motion.section>
);

export default LandingHero;
