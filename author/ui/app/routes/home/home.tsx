import type { Route } from "./+types/home";
import { useNavigate } from "react-router";
import { FaTools } from "react-icons/fa";
import { FaFileLines, FaFilePen } from "react-icons/fa6";
import HomeIcon from "./HomeIcon";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home | AEMM" },
    { name: "description", content: "Author app dashboard" },
  ];
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="grid grid-cols-3 gap-8">
        <HomeIcon
          text="Sites"
          icon={FaFileLines}
          onClick={() => navigate("/sites")}
        />
        <HomeIcon
          text="Editor"
          icon={FaFilePen}
          onClick={() => navigate("/editor")}
        />
        <HomeIcon
          text="Administration"
          icon={FaTools}
          onClick={() => navigate("/admin")}
        />
      </div>
    </div>
  );
}
