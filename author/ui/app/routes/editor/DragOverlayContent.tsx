export function DragOverlayContent({
  activeId,
  activeNode,
}: {
  activeId: string | null;
  activeNode: any;
}) {
  if (activeNode) {
    return (
      <div className="border-2 border-blue-500 bg-white rounded shadow-lg p-2 opacity-90">
        <div className="text-xs font-semibold text-blue-600">
          {activeNode.type}
        </div>
      </div>
    );
  }

  if (activeId?.startsWith("component:")) {
    return (
      <div className="border-2 border-blue-500 bg-white rounded shadow-lg p-2 opacity-90">
        <div className="text-xs font-semibold text-blue-600">
          {activeId.split(":")[1]}
        </div>
      </div>
    );
  }

  return null;
}
