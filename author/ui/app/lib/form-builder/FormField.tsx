import React from "react";
import { z } from "zod";
import {
  FormControl,
  FormDescription,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface FormFieldProps {
  name: string;
  control: any;
  schema: any;
}

// Parse metadata from description JSON
function parseDescription(description?: string) {
  if (!description) return { kind: "plainText", about: "" };

  try {
    const parsed = JSON.parse(description);
    return { kind: parsed.kind || "plainText", about: parsed.about || "" };
  } catch {
    return { kind: "plainText", about: description };
  }
}

// Generate label from field name
function generateLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Unwrap optional fields
function unwrapOptional(schema: any): {
  schema: any;
  required: boolean;
  description?: string;
} {
  if (schema instanceof z.ZodOptional) {
    const description =
      (schema as any).description || (schema.unwrap() as any).description;
    return { schema: schema.unwrap(), required: false, description };
  }
  return { schema, required: true, description: (schema as any).description };
}

// Reusable wrapper for standard form fields
interface StandardFieldWrapperProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function StandardFieldWrapper({
  label,
  description,
  children,
}: StandardFieldWrapperProps) {
  return (
    <FormItem className="px-0 py-0 mb-2">
      <FormLabel className="block">{label}</FormLabel>
      {description && <FormDescription>{description}</FormDescription>}
      <FormControl>{children}</FormControl>
      <div>
        <FormMessage />
      </div>
    </FormItem>
  );
}

export function FormField({
  name,
  control,
  schema: rawSchema,
}: FormFieldProps) {
  const { schema, description } = unwrapOptional(rawSchema);
  const { kind, about } = parseDescription(description);
  const label = generateLabel(name);

  if (schema instanceof z.ZodBoolean) {
    return (
      <ShadcnFormField
        name={name}
        control={control}
        render={({ field }) => (
          <FormItem className="px-0 py-0 mb-2 flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>{label}</FormLabel>
              {about && <FormDescription>{about}</FormDescription>}
            </div>
            <div>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    );
  }

  if (schema instanceof z.ZodEnum) {
    const options = schema.options as string[];
    return (
      <ShadcnFormField
        name={name}
        control={control}
        render={({ field }) => (
          <StandardFieldWrapper label={label} description={about}>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </StandardFieldWrapper>
        )}
      />
    );
  }

  if (schema instanceof z.ZodNumber) {
    return (
      <ShadcnFormField
        name={name}
        control={control}
        render={({ field }) => (
          <StandardFieldWrapper label={label} description={about}>
            <Input
              type="number"
              {...field}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === "" ? undefined : Number(value));
              }}
              className="h-10"
            />
          </StandardFieldWrapper>
        )}
      />
    );
  }

  if (kind === "richText") {
    return (
      <ShadcnFormField
        name={name}
        control={control}
        render={({ field }) => (
          <StandardFieldWrapper label={label} description={about}>
            <textarea
              {...field}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </StandardFieldWrapper>
        )}
      />
    );
  }

  return (
    <ShadcnFormField
      name={name}
      control={control}
      render={({ field }) => (
        <StandardFieldWrapper label={label} description={about}>
          <Input
            type={kind === "url" ? "url" : "text"}
            {...field}
            className="h-10"
          />
        </StandardFieldWrapper>
      )}
    />
  );
}
