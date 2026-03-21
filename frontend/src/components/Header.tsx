import { Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-30 glass px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[--text-primary] flex items-center justify-center">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-[--text-primary] tracking-tight">
              argus
            </span>
            <span className="text-lg font-light text-[--text-muted] tracking-tight">
              labs
            </span>
          </div>
          <p className="label-muted -mt-0.5">neural mri intelligence</p>
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
