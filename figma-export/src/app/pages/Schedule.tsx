import { ChevronLeft, ChevronRight, Music2, MapPin } from "lucide-react";
import { useState } from "react";
import NavBar from "../components/NavBar";
import BottomNav from "../components/BottomNav";

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(3); // Wednesday selected

  const weekDays = [
    { day: "一", date: 14, hasLesson: true },
    { day: "二", date: 15, hasLesson: false },
    { day: "三", date: 16, hasLesson: true },
    { day: "四", date: 17, hasLesson: true },
    { day: "五", date: 18, hasLesson: false },
    { day: "六", date: 19, hasLesson: true },
    { day: "日", date: 20, hasLesson: false },
  ];

  const lessons = [
    {
      id: 1,
      time: "10:00-11:00",
      course: "钢琴基础课",
      teacher: "王老师",
      teacherAvatar: "王",
      room: "A101 教室",
      status: "待上课",
    },
    {
      id: 2,
      time: "15:00-16:00",
      course: "钢琴进阶课",
      teacher: "李老师",
      teacherAvatar: "李",
      room: "B205 教室",
      status: "待上课",
    },
    {
      id: 3,
      time: "18:30-19:15",
      course: "乐理课",
      teacher: "张老师",
      teacherAvatar: "张",
      room: "C302 教室",
      status: "待上课",
    },
  ];

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

      {/* Subtle treble clef watermark */}
      <div className="absolute top-1/3 right-0 opacity-[0.02] pointer-events-none">
        <Music2 className="w-64 h-64 text-[#C9A84C]" strokeWidth={0.5} />
      </div>

      <NavBar title="课程表" showBack={false} />

      <div className="relative max-w-[375px] mx-auto pt-14 px-6">
        {/* Month header */}
        <div className="flex items-center justify-between py-6">
          <button className="p-2 hover:bg-[#22222A] rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#C9A84C]" strokeWidth={1.5} />
          </button>
          <h2 className="font-['Playfair_Display'] text-[18px] text-[#F0EDE6]">
            2026年4月
          </h2>
          <button className="p-2 hover:bg-[#22222A] rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-[#C9A84C]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Week strip date picker */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-1">
            {weekDays.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(index)}
                className="flex-1 flex flex-col items-center py-3 rounded-xl transition-all relative"
              >
                <span className="text-[12px] text-[#A89F8C] mb-2">
                  {day.day}
                </span>
                <span
                  className={`text-[16px] font-medium transition-colors relative ${
                    selectedDate === index ? "text-[#C9A84C]" : "text-[#F0EDE6]"
                  }`}
                >
                  {day.date}
                  {day.hasLesson && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C9A84C]" />
                  )}
                </span>
                {selectedDate === index && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#C9A84C] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Daily lesson cards */}
        <div className="space-y-4 pb-6">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-[#22222A] rounded-2xl border border-[#2E2D35] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:border-[#C9A84C]/30 transition-all relative"
            >
              {/* Gold left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#E2C07A] to-[#C9A84C]" />

              <div className="p-5 pl-6">
                {/* Time pill */}
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 mb-3">
                  <span className="text-[12px] font-mono text-[#C9A84C] tabular-nums">
                    {lesson.time}
                  </span>
                </div>

                {/* Course name */}
                <h3 className="font-['Playfair_Display'] text-[18px] text-[#F0EDE6] mb-3">
                  {lesson.course}
                </h3>

                {/* Teacher and room info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Teacher avatar chip */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8B6914] flex items-center justify-center text-[#1A1A1F] text-[12px] font-medium">
                        {lesson.teacherAvatar}
                      </div>
                      <span className="text-[14px] text-[#F0EDE6]">
                        {lesson.teacher}
                      </span>
                    </div>

                    {/* Room tag */}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1A1A1F] border border-[#2E2D35]">
                      <MapPin className="w-3 h-3 text-[#A89F8C]" strokeWidth={1.5} />
                      <span className="text-[11px] text-[#A89F8C]">
                        {lesson.room}
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className="px-3 py-1 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] text-[11px] font-medium">
                    {lesson.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state example (commented out, for when no lessons) */}
        {/* <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#C9A84C] blur-2xl opacity-10 rounded-full" />
            <Music2 className="relative w-16 h-16 text-[#C9A84C]/30" strokeWidth={1} />
          </div>
          <p className="text-[14px] text-[#A89F8C]">本日暂无课程</p>
        </div> */}
      </div>

      <BottomNav />
    </div>
  );
}