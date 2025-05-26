import React from 'react';
import { motion } from 'framer-motion';

const MotionSection = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 100 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, ease: 'easeOut' }}
    viewport={{ once: true }} // Animation happens only once
  >
    {children}
  </motion.div>
);

export default MotionSection;