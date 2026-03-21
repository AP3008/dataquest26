import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const scrollToScan = () => {
    document.getElementById('scan')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center"
      >
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-[--text-primary] lowercase">
          argus{' '}
          <span className="font-light text-[--text-muted]">labs</span>
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-4 text-lg sm:text-xl text-[--text-muted] tracking-[0.2em] uppercase text-sm"
        >
          neural mri intelligence
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-24 flex items-center gap-8"
      >
        {['CNN Model', '3D Mapping', '4-Class Detection'].map((tag, i) => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + i * 0.15 }}
            className="flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[--text-muted]" />
            <span className="text-xs text-[--text-muted] tracking-wide">{tag}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        onClick={scrollToScan}
        className="absolute bottom-8 text-[--text-muted] hover:text-[--text-primary] transition-colors cursor-pointer"
        aria-label="Scroll to scan section"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </section>
  );
}
