import type { Field } from "payload";

export function publishControlsField(): Field {
  return {
    name: "publishControls",
    type: "ui",
    admin: {
      position: "sidebar",
      components: {
        Field: "/src/components/admin/PublishControls#PublishControls",
      },
    },
  };
}
