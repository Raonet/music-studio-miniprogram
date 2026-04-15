import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

interface NavBarProps {
  title: string;
  showBack?: boolean;
}

export default function NavBar({ title, showBack = true }: NavBarProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 bg-[#1A1A1F]/80 backdrop-blur-lg border-b border-[#2E2D35] z-50">
      <div className="max-w-[375px] mx-auto h-14 flex items-center justify-center px-4 relative pt-safe">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 pt-safe"
          >
            <ArrowLeft className="w-5 h-5 text-[#C9A84C]" strokeWidth={1.5} />
          </button>
        )}
        <h1 className="font-['Playfair_Display'] text-[16px] text-[#F0EDE6] text-center">
          {title}
        </h1>
      </div>
    </div>
  );
}
