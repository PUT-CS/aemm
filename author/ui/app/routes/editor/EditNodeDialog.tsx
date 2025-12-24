import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { AutoForm } from "~/lib/form-builder/AutoForm";
import type { EditorNode } from "~/routes/editor/EditorContextProvider";
import COMPONENT_REGISTRY from "~/components/authoring/registry";

interface EditNodeDialogProps {
  node: EditorNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (props: Record<string, any>) => void;
}

export function EditNodeDialog({
  node,
  open,
  onOpenChange,
  onSave,
}: EditNodeDialogProps) {
  const Component = COMPONENT_REGISTRY[
    node.type as keyof typeof COMPONENT_REGISTRY
  ] as any;

  if (!Component) {
    return null;
  }

  const schema = new Component({}).getSchema();

  const handleSubmit = (data: Record<string, any>) => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit {node.type} (#{node.id})
          </DialogTitle>
        </DialogHeader>
        <AutoForm
          schema={schema}
          defaultValues={node.props}
          onSubmit={handleSubmit}
          submitLabel="Save"
        />
      </DialogContent>
    </Dialog>
  );
}
