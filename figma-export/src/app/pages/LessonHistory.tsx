import { useState } from "react";
import NavBar from "../components/NavBar";
import BottomNav from "../components/BottomNav";
import { Clock } from "lucide-react";

export default function LessonHistory() {
  const [activeTab, setActiveTab] = useState("全部");

  const tabs = ["全部", "已上课", "已请假", "待补课"];

  const lessonRecords = [
    {
      id: 1,
      date: "2026-04-14 14:00",
      course: "钢琴基础课",
      teacher: "王老师",
      duration: "60分钟",
      status: "已上课",
    },
    {
      id: 2,
      date: "2026-04-12 15:00",
      course: "乐理课",
      teacher: "李老师",
      duration: "45分钟",
      status: "已上课",
    },
    {
      id: 3,
      date: "2026-04-10 10:00",
      course: "钢琴进阶课",
      teacher: "张老师",
      duration: "60分钟",
      status: "已上课",
    },
    {
      id: 4,
      date: "2026-04-08 16:00",
      course: "钢琴基础课",
      teacher: "王老师",
      duration: "60分钟",
      status: "已请假",
    },
    {
      id: 5,
      date: "2026-04-06 14:00",
      course: "乐理课",
      teacher: "李老师",
      duration: "45分钟",
      status: "已上课",
    },
    {
      id: 6,
      date: "2026-04-04 15:00",
      course: "钢琴进阶课",
      teacher: "张老师",
      duration: "60分钟",
      status: "待补课",
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "已上课":
        return "bg-[#4CAF7D]/20 text-[#4CAF7D]";
      case "已请假":
        return "bg-[#5A5550]/20 text-[#A89F8C]";
      case "待补课":
        return "bg-[#E2A84C]/20 text-[#E2A84C]";
      default:
        return "bg-[#C9A84C]/20 text-[#C9A84C]";
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1F] pb-20 relative overflow-hidden">
      {/* Noise grain overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay">
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <NavBar title="课时记录" />

      <div className="relative max-w-[375px] mx-auto pt-14">
        {/* Filter tabs */}
        <div className="px-6 py-4 border-b border-[#2E2D35]">
          <div className="flex items-center gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative pb-2 transition-colors"
              >
                <span
                  className={`text-[14px] transition-colors ${
                    activeTab === tab ? "text-[#C9A84C]" : "text-[#A89F8C]"
                  }`}
                >
                  {tab}
                </span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A84C] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Lesson record cards */}
        <div className="px-6 py-6 space-y-4">
          {lessonRecords.map((record) => (
            <div
              key={record.id}
              className="bg-[#22222A] rounded-2xl border border-[#2E2D35] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:border-[#C9A84C]/30 transition-all relative"
            >
              {/* Gold left vertical bar accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#E2C07A] to-[#C9A84C]" />

              <div className="p-5 pl-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-[16px] text-[#F0EDE6] mb-1">
                      {record.course}
                    </h3>
                    <div className="flex items-center gap-2 text-[12px] text-[#A89F8C]">
                      <Clock className="w-3 h-3" strokeWidth={1.5} />
                      <span>{record.date}</span>
                    </div>
                  </div>
                  {/* Status chip */}
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-medium ${getStatusStyle(
                      record.status
                    )}`}
                  >
                    {record.status}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Teacher */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8B6914] flex items-center justify-center text-[#1A1A1F] text-[10px] font-medium">
                      {record.teacher[0]}
                    </div>
                    <span className="text-[12px] text-[#A89F8C]">
                      {record.teacher}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1A1A1F] border border-[#2E2D35]">
                    <span className="text-[11px] text-[#A89F8C]">
                      {record.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom summary bar */}
        <div className="fixed bottom-16 left-0 right-0 bg-[#22222A] border-t border-[#2E2D35] shadow-[0_-4px_16px_rgba(0,0,0,0.3)]">
          <div className="max-w-[375px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-[12px] text-[#A89F8C] mb-1">已消耗课时</p>
                <p className="text-[20px] font-mono text-[#C9A84C] tabular-nums">
                  36<span className="text-[14px] ml-1">节</span>
                </p>
              </div>
              <div className="w-px h-8 bg-[#2E2D35]" />
              <div className="text-center flex-1">
                <p className="text-[12px] text-[#A89F8C] mb-1">累计学习时长</p>
                <p className="text-[20px] font-mono text-[#C9A84C] tabular-nums">
                  54<span className="text-[14px] ml-1">小时</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
