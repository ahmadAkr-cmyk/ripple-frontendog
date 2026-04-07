import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const PageTransition = forwardRef(({ children, className }, ref) => (
  <motion.div
    ref={ref}
    className={className}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
));

PageTransition.displayName = 'PageTransition';

export default PageTransition;
