import { useNavigate } from "react-router";
import { FaTools } from "react-icons/fa";
import { FaFileCode, FaFileLines, FaFilePen } from "react-icons/fa6";
import HomeIcon from "./HomeIcon";
import { useCurrentUser } from "~/lib/auth";

export function meta() {
  return [
    { title: "Home | AEMM" },
    { name: "description", content: "Author app dashboard" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();

  return (
    <div className="h-full flex items-center justify-center">
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
        {user?.role === "admin" && (
          <HomeIcon
            text="Administration"
            icon={FaTools}
            onClick={() => navigate("/admin")}
          />
        )}
        <HomeIcon
          text="Demo (internal)"
          icon={FaFileCode}
          onClick={() => navigate("/demo")}
        />
      </div>
    </div>
  );
}
