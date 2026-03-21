import { Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-30 px-6 py-4 flex items-center justify-between bg-white/40 backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[--text-primary] flex items-center justify-center">
          <Eye className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold text-[--text-primary] tracking-tight">
            argus
          </span>
          <span className="text-base font-light text-[--text-muted] tracking-tight">
            labs
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-xs text-[--text-muted]">System online</span>
      </div>
    </motion.header>
  );
}
