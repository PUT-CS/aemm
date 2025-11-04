import { useQuery } from "@tanstack/react-query";

interface ColumnProps {
  path: string;
  selectedChildPath?: string;
  onItemClick: (itemPath: string) => void;
}

export default function Column({
  path,
  selectedChildPath,
  onItemClick,
}: ColumnProps) {
  const fetchContent = async (path: string) => {
    const response = await fetch(`http://localhost:4500${path}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["content", path],
    queryFn: () => fetchContent(path),
  });

  const handleClick = (itemPath: string) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      onItemClick(itemPath);
    };
  };

  return (
    <div className="border p-4 m-2 min-w-[200px]">
      {isLoading && <div className="text-sm text-gray-500">Loading...</div>}
      {isError && (
        <div className="text-sm text-red-500">Error loading content</div>
      )}
      {data && data.children && (
        <div className="space-y-1">
          {data.children.map((item: any) => (
            <a
              href={item.path}
              key={item.path}
              onClick={handleClick(item.path)}
              className={`block p-2 rounded hover:bg-blue-100 cursor-pointer ${
                selectedChildPath === item.path
                  ? "bg-blue-200 font-semibold"
                  : ""
              }`}
            >
              <div className="text-sm">{item.name}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
