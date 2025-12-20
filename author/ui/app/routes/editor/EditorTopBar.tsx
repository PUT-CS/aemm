import { useEditorContext } from "~/routes/editor/EditorContextProvider";
import { Button } from "~/components/ui/button";
import { FaSave, FaSpinner } from "react-icons/fa";
import { useNavigate, useParams } from "react-router";
import { FaArrowLeft, FaEye } from "react-icons/fa6";

export function EditorTopBar() {
  const { saveContent, isSaving } = useEditorContext();
  const navigate = useNavigate();
  const params = useParams();
  const splat = params["*"] || "";
  const path = splat ? `/${splat}` : "";

  const handleBack = () => {
    // Navigate back to sites browser with the same path
    navigate(`/sites${path}`);
  };

  const handlePreview = () => {
    // Open preview in new tab
    window.open(`/preview${path}`, "_blank");
  };

  return (
    <div className="h-14 border-b bg-white flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2"
        >
          <FaArrowLeft size={14} />
          Back to Sites
        </Button>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Editing:</span> {path || "(no path)"}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handlePreview}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <FaEye size={14} />
          Preview
        </Button>
        <Button
          onClick={saveContent}
          disabled={isSaving}
          className="gap-2"
          size="sm"
        >
          {isSaving ? (
            <>
              <FaSpinner className="animate-spin" size={14} />
              Saving...
            </>
          ) : (
            <>
              <FaSave size={14} />
              Save
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
