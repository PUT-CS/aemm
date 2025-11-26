import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "~/components/ui/form";
import { DialogFooter } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { FormField } from "./FormField.js";

interface AutoFormProps {
  schema: z.ZodObject<any>;
  defaultValues?: Record<string, any>;
  onSubmit: (data: any) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function AutoForm({
  schema,
  defaultValues = {},
  onSubmit,
  submitLabel = "Submit",
  isSubmitting = false,
}: AutoFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const fields = Object.keys(schema.shape);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-0"
      >
        {fields.map((fieldName) => (
          <FormField
            key={fieldName}
            name={fieldName}
            control={form.control}
            schema={schema.shape[fieldName]}
          />
        ))}
        <DialogFooter>
          <Button type="submit" className="mt-4 h-10" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
