import type { DialogProps } from "~/routes/sites/dialogs/dialog.types";
import { Button } from "~/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFile } from "./mutations";

export default function FileUploadDialog({ parentPath, onClose }: DialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const queryClient = useQueryClient();
  console.log("FileUploadDialog parentPath:", parentPath);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadFile(parentPath, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      setSelectedFile(null);
      onClose?.(); // Close the dialog after successful upload
    },
    onError: (error: Error) => {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
    },
  });

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Upload File</DialogTitle>
        <DialogDescription>
          It will be available under {parentPath}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 transition-colors text-center
            ${isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"}
          `}
        >
          <input
            id="file"
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedFile(null)}
                className="mt-2"
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                {isDragging ? "Drop file here" : "Drag and drop a file here"}
              </p>
              <p className="text-xs text-slate-500">or</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file")?.click()}
              >
                Choose File
              </Button>
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploadMutation.isPending}
        >
          {uploadMutation.isPending ? "Uploading..." : "Upload"}
        </Button>
      </DialogFooter>
    </>
  );
}
