import { Home, Calendar, Clock, MessageSquare, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { icon: Home, label: "首页", path: "/" },
    { icon: Calendar, label: "课程表", path: "/schedule" },
    { icon: Clock, label: "课时", path: "/history" },
    { icon: MessageSquare, label: "消息", path: "/messages" },
    { icon: User, label: "我的", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#16161C] border-t border-[#2E2D35] pb-safe z-50">
      <div className="max-w-[375px] mx-auto flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-[#C9A84C]" : "text-[#5A5550]"
                }`}
                strokeWidth={1.5}
              />
              <span
                className={`text-[10px] transition-colors ${
                  isActive ? "text-[#C9A84C]" : "text-[#5A5550]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
