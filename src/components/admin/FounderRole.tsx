"use client";
import React, { useEffect } from "react";
import { SelectField, useAuth, useField } from "@payloadcms/ui";
import type { SelectFieldClientProps } from "payload";

export function FounderRole(props: SelectFieldClientProps) {
  const { user } = useAuth();
  const { value, setValue } = useField<string>({ path: props.path || "role" });

  useEffect(() => {
    if (!user && value !== "admin") {
      setValue("admin");
    }
  }, [user, value, setValue]);

  const effectiveValue = !user ? "admin" : value;

  return (
    <SelectField
      {...props}
      value={effectiveValue}
      readOnly={!user || props.readOnly}
    />
  );
}
