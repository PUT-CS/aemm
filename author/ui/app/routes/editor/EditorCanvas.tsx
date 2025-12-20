import { useEditorContext } from "~/routes/editor/EditorContextProvider";
import AuthoringOverlay from "~/routes/editor/AuthoringOverlay";
import { CanvasDropZone } from "~/routes/editor/CanvasDropZone";

interface EditorCanvasProps {
  isDragging: boolean;
}

export function EditorCanvas({ isDragging }: EditorCanvasProps) {
  const { nodes, setSelectedId } = useEditorContext();

  return (
    <div
      id="editor-canvas"
      className="flex-1 p-4 isolate text-base overflow-auto"
      onClick={() => setSelectedId(null)}
    >
      {nodes.map((node) => (
        <AuthoringOverlay key={node.id} node={node} />
      ))}
      <CanvasDropZone isEmpty={nodes.length === 0} isDragging={isDragging} />
    </div>
  );
}
