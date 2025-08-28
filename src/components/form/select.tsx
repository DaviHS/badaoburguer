import React from "react";
import { useFormContext } from "react-hook-form";
import type * as SelectPrimitive from "@radix-ui/react-select";

import {
  Select as SelectSC,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

interface SelectProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SelectTrigger>,
    "name" | "value" | "defaultValue"
  > {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

const Select = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  SelectProps
>(({ name, description, label, children, className, placeholder }, ref) => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <SelectSC onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger ref={ref}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>{children}</SelectContent>
          </SelectSC>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
});

Select.displayName = "Select";

export { Select };
