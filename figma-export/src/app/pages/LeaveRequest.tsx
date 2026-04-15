import { useState } from "react";
import NavBar from "../components/NavBar";
import BottomNav from "../components/BottomNav";
import { ChevronDown, Calendar, Info } from "lucide-react";

export default function LeaveRequest() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [reason, setReason] = useState("");

  const courses = [
    "钢琴基础课 - 王老师",
    "钢琴进阶课 - 李老师",
    "乐理课 - 张老师",
  ];

  const policies = [
    "请假需提前24小时申请，否则将扣除课时",
    "每月仅可请假2次，超出次数将视为旷课",
    "请假成功后，课时将自动保留，可在有效期内补课",
    "如遇紧急情况，请联系教务老师说明",
  ];

  const handleSubmit = () => {
    // Handle form submission
    console.log({ selectedCourse, selectedDate, reason });
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

      <NavBar title="请假申请" />

      <div className="relative max-w-[375px] mx-auto pt-14 px-6 py-6">
        {/* Form card with gold header ornament */}
        <div className="bg-[#22222A] rounded-2xl border border-[#2E2D35] shadow-[0_4px_24px_rgba(0,0,0,0.6)] overflow-hidden mb-6">
          {/* Gold header ornament */}
          <div className="h-1 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

          <div className="p-6 space-y-6">
            {/* Select course */}
            <div>
              <label className="block text-[14px] text-[#F0EDE6] mb-3">
                选择课程
              </label>
              <div className="relative">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#2E2D35] rounded-xl text-[14px] text-[#F0EDE6] appearance-none cursor-pointer focus:border-[#C9A84C] focus:outline-none focus:shadow-[0_0_12px_rgba(201,168,76,0.2)] transition-all"
                >
                  <option value="">请选择要请假的课程</option>
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F8C] pointer-events-none" />
              </div>
            </div>

            {/* Date picker */}
            <div>
              <label className="block text-[14px] text-[#F0EDE6] mb-3">
                请假日期
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#2E2D35] rounded-xl text-[14px] text-[#F0EDE6] cursor-pointer focus:border-[#C9A84C] focus:outline-none focus:shadow-[0_0_12px_rgba(201,168,76,0.2)] transition-all [color-scheme:dark]"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F8C] pointer-events-none" />
              </div>
            </div>

            {/* Reason textarea */}
            <div>
              <label className="block text-[14px] text-[#F0EDE6] mb-3">
                请假原因
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请简要说明请假原因..."
                rows={4}
                className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#2E2D35] rounded-xl text-[14px] text-[#F0EDE6] placeholder:text-[#5A5550] resize-none focus:border-[#C9A84C] focus:outline-none focus:shadow-[0_0_12px_rgba(201,168,76,0.2)] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Policy note section */}
        <div className="bg-[#22222A] rounded-2xl border border-[#2E2D35] p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-[#C9A84C]/20 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.5} />
            </div>
            <h3 className="font-['Playfair_Display'] text-[16px] text-[#F0EDE6]">
              请假须知
            </h3>
          </div>

          <div className="space-y-3 pl-9">
            {policies.map((policy, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-[12px] text-[#C9A84C] font-serif mt-0.5">
                  {index + 1}.
                </span>
                <p className="text-[12px] text-[#A89F8C] leading-relaxed font-serif">
                  {policy}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedCourse || !selectedDate || !reason}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E2C07A] text-[#1A1A1F] text-[16px] font-medium shadow-[0_4px_16px_rgba(201,168,76,0.3)] hover:shadow-[0_4px_24px_rgba(201,168,76,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
        >
          提交申请
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
