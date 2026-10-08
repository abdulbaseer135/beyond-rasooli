import type { UIField } from "payload";
export function creationHelpField(): UIField {
  return { name: "creationHelp", type: "ui", admin: { components: { Field: "/src/components/admin/CreationHelp#CreationHelp" } } };
}
