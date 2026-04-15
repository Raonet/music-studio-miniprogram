import NavBar from "../components/NavBar";
import BottomNav from "../components/BottomNav";
import { User } from "lucide-react";

export default function Profile() {
  return (
    <div className="min-h-screen bg-[#1A1A1F] pb-20 relative overflow-hidden">
      <NavBar title="我的" showBack={false} />

      <div className="relative max-w-[375px] mx-auto pt-14 px-6 py-6">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#C9A84C] blur-2xl opacity-10 rounded-full" />
            <User className="relative w-16 h-16 text-[#C9A84C]/30" strokeWidth={1} />
          </div>
          <p className="text-[14px] text-[#A89F8C]">个人中心开发中</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
