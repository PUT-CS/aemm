import {useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";

function Column({ path }: { path: string }) {
  const fetchContent = async (path: string) => {
    const response = await fetch(`http://localhost:4500`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
  }

  const {data, isLoading, isError } = useQuery({queryKey: ['content', path], queryFn: () => fetchContent(path)});

  return (
      <div className='border p-4 m-2'>
        {path}
        {isLoading && <div>Loading...</div>}
        {isError && <div>Error loading content</div>}
        {data && (
            <ul>
              {data.items.map((item: { name: string; isDirectory: boolean }) => (
                  <li key={item.name}>
                    {item.isDirectory ? '📁' : '📄'} {item.name}
                  </li>
              ))}
            </ul>
        )}
      </div>
  );
}

export default function SiteBrowser() {
  const[columns, setColumns] = useState(['/']);

  return (
      <div>
        Site Browser Page
        <div className='flex'>
          {columns.map((column, index) => (
              <Column key={index} path={column} />
          ))}
        </div>
      </div>
  );
}