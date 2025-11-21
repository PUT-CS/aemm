import type { DialogProps } from "~/routes/sites/dialogs/dialog.types";

export default function FileUploadDialog({ parentPath }: DialogProps) {
  return (
    <div>
      FileUploadDialog
      <span>{parentPath}</span>
    </div>
  );
}
