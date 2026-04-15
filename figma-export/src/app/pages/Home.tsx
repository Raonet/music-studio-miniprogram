import { Calendar, FileText, MessageSquare, Clock, Music2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";
import { useState } from "react";
import ReminderModal from "../components/ReminderModal";

export default function Home() {
  const navigate = useNavigate();
  const [showReminder, setShowReminder] = useState(false);

  const quickActions = [
    { icon: Calendar, label: "课程表", path: "/schedule" },
    { icon: FileText, label: "请假", path: "/leave" },
    { icon: Clock, label: "课时记录", path: "/history" },
    { icon: MessageSquare, label: "消息", path: "/messages" },
  ];

  const recentLessons = [
    {
      id: 1,
      date: "2026-04-14",
      type: "钢琴基础课",
      teacher: "王老师",
      duration: "60分钟",
    },
    {
      id: 2,
      date: "2026-04-12",
      type: "乐理课",
      teacher: "李老师",
      duration: "45分钟",
    },
    {
      id: 3,
      date: "2026-04-10",
      type: "钢琴进阶课",
      teacher: "张老师",
      duration: "60分钟",
    },
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1F] pb-20 relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 20px, #C9A84C 20px, #C9A84C 21px)`,
        }} />
      </div>

      {/* Noise grain overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay">
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <div className="relative max-w-[375px] mx-auto">
        {/* Header with greeting */}
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] text-[#A89F8C] mb-1">下午好</p>
              <h1 className="text-[20px] text-[#F0EDE6]">陈同学</h1>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8B6914] flex items-center justify-center text-[#1A1A1F] font-medium text-[16px]">
              陈
            </div>
          </div>
        </div>

        {/* Hero card - Remaining lessons */}
        <div className="px-6 mb-6">
          <div className="bg-[#22222A] rounded-2xl p-6 border-2 border-[#C9A84C] shadow-[0_4px_24px_rgba(0,0,0,0.6)] relative overflow-hidden">
            {/* Decorative corner flourishes */}
            <svg
              className="absolute top-0 left-0 w-12 h-12 text-[#C9A84C] opacity-20"
              viewBox="0 0 48 48"
              fill="none"
            >
              <path
                d="M0 0 L24 0 C18 6 12 12 6 18 L0 24 Z"
                fill="currentColor"
              />
            </svg>
            <svg
              className="absolute bottom-0 right-0 w-12 h-12 text-[#C9A84C] opacity-20 rotate-180"
              viewBox="0 0 48 48"
              fill="none"
            >
              <path
                d="M0 0 L24 0 C18 6 12 12 6 18 L0 24 Z"
                fill="currentColor"
              />
            </svg>

            {/* Decorative watermark */}
            <div className="absolute top-4 right-4 opacity-5">
              <Music2 className="w-24 h-24 text-[#C9A84C]" strokeWidth={1} />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[12px] text-[#A89F8C] mb-2">剩余课时</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-mono text-[48px] text-[#C9A84C] tabular-nums leading-none">
                    24
                  </span>
                  <span className="text-[16px] text-[#A89F8C]">节</span>
                </div>
                <p className="text-[12px] text-[#A89F8C]">
                  有效期至 2026-12-31
                </p>
              </div>

              {/* Progress ring */}
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    fill="none"
                    stroke="#2E2D35"
                    strokeWidth="6"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    fill="none"
                    stroke="url(#goldGradient)"
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 38 * 0.6} ${2 * Math.PI * 38}`}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]"
                  />
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E2C07A" />
                      <stop offset="100%" stopColor="#C9A84C" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[16px] font-mono text-[#C9A84C] tabular-nums">60%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next lesson banner */}
        <div className="px-6 mb-6">
          <div
            onClick={() => setShowReminder(true)}
            className="bg-gradient-to-r from-[#22222A] to-[#2A2A35] rounded-2xl p-5 border border-[#2E2D35] shadow-[0_4px_16px_rgba(0,0,0,0.4)] cursor-pointer hover:border-[#C9A84C]/50 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] text-[#A89F8C]">下节课</p>
              <span className="px-3 py-1 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] text-[10px] font-medium">
                明天 15:00
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-['Playfair_Display'] text-[18px] text-[#F0EDE6] mb-1">
                  钢琴进阶课
                </h3>
                <p className="text-[12px] text-[#A89F8C]">授课老师：李老师</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-[#C9A84C]/10 text-[#C9A84C] text-[12px] font-medium hover:bg-[#C9A84C]/20 transition-colors">
                查看详情
              </button>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-6 mb-6">
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#22222A] border border-[#2E2D35] flex items-center justify-center group-hover:border-[#C9A84C] group-hover:shadow-[0_0_12px_rgba(201,168,76,0.2)] transition-all">
                    <Icon className="w-6 h-6 text-[#C9A84C]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[12px] text-[#A89F8C] group-hover:text-[#C9A84C] transition-colors">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent lesson history */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Playfair_Display'] text-[16px] text-[#F0EDE6]">
              近期课程
            </h2>
            <button
              onClick={() => navigate("/history")}
              className="text-[12px] text-[#C9A84C] hover:text-[#E2C07A] transition-colors"
            >
              查看全部
            </button>
          </div>

          <div className="space-y-3">
            {recentLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-[#22222A] rounded-xl p-4 border border-[#2E2D35] hover:border-[#C9A84C]/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[14px] text-[#F0EDE6]">
                        {lesson.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#4CAF7D]/20 text-[#4CAF7D] text-[10px] font-medium">
                        已上课
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[12px] text-[#A89F8C]">
                      <span>{lesson.date}</span>
                      <span>{lesson.teacher}</span>
                      <span>{lesson.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#4CAF7D]/20">
                    <TrendingUp className="w-3 h-3 text-[#4CAF7D]" strokeWidth={2} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
      <ReminderModal isOpen={showReminder} onClose={() => setShowReminder(false)} />
    </div>
  );
}