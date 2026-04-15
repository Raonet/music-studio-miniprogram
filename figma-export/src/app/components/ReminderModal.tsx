import { Music, X } from "lucide-react";
import { motion } from "motion/react";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReminderModal({ isOpen, onClose }: ReminderModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      
      {/* Modal content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-[#22222A] rounded-2xl p-8 max-w-[340px] w-full shadow-2xl border border-[#2E2D35]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A89F8C] hover:text-[#F0EDE6] transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Music note icon with gold glow */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[#C9A84C] blur-xl opacity-30 rounded-full" />
            <div className="relative bg-gradient-to-br from-[#E2C07A] to-[#C9A84C] p-4 rounded-full">
              <Music className="w-8 h-8 text-[#1A1A1F]" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Lesson info */}
        <div className="text-center mb-6">
          <h2 className="font-['Playfair_Display'] text-[24px] text-[#F0EDE6] mb-2">
            钢琴进阶课
          </h2>
          <div className="text-[14px] text-[#A89F8C] space-y-1">
            <p>2026年4月16日 15:00</p>
            <p>授课老师：李老师</p>
          </div>
        </div>

        {/* Countdown timer */}
        <div className="bg-[#1A1A1F] rounded-xl p-4 mb-6 border border-[#2E2D35]">
          <div className="text-center">
            <p className="text-[12px] text-[#A89F8C] mb-2">距离上课</p>
            <div className="font-mono text-[32px] text-[#C9A84C] tabular-nums tracking-wider">
              23:45:12
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#C9A84C] text-[#C9A84C] text-[14px] font-medium hover:bg-[#C9A84C]/10 transition-colors"
          >
            联系老师
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E2C07A] text-[#1A1A1F] text-[14px] font-medium hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all"
          >
            已知晓
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
