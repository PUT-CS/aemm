import { useParams } from "react-router";
import React, { useEffect, useState } from "react";
import { BACKEND_URL } from "~/consts";
import type { Page } from "@aemm/common";
import type { EditorNode } from "~/routes/editor/EditorContextProvider";
import COMPONENT_REGISTRY from "~/components/authoring/registry";

export async function clientLoader() {
  return null;
}

function RenderNode({ node }: { node: EditorNode }) {
  const Component = COMPONENT_REGISTRY[
    node.type as keyof typeof COMPONENT_REGISTRY
  ] as React.ComponentType<any>;

  if (!Component) {
    return null;
  }

  const children = node.children.map((child) => (
    <RenderNode key={child.id} node={child} />
  ));

  return <Component {...node.props}>{children}</Component>;
}

export default function Preview() {
  const params = useParams();
  const splat = params["*"] || "";
  const path = splat ? `/${splat}` : "";

  const [nodes, setNodes] = useState<EditorNode[]>([]);
  const [pageData, setPageData] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!path) {
        setError("No path provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`${BACKEND_URL}/scr${path}`);

        if (response.ok) {
          const data: Page = await response.json();
          setPageData(data);

          if (data.components && Array.isArray(data.components)) {
            setNodes(data.components as EditorNode[]);
          } else {
            setNodes([]);
          }
        } else if (response.status === 404) {
          setError("Page not found");
        } else {
          setError(`Failed to load content: ${response.statusText}`);
        }
      } catch (err) {
        setError(`Error loading content: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [path]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading preview...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {pageData?.htmlTitle && <title>{pageData.htmlTitle}</title>}
      {nodes.map((node) => (
        <RenderNode key={node.id} node={node} />
      ))}
      {nodes.length === 0 && (
        <div className="flex items-center justify-center h-screen text-gray-400">
          No content to preview
        </div>
      )}
    </div>
  );
}
