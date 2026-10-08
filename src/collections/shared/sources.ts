import type { Field } from "payload";

export const sourceFields: Field[] = [
  {
    name: "sourceType",
    type: "select",
    required: true,
    defaultValue: "paper",
    options: [
      { label: "Academic Paper / Study", value: "paper" },
      { label: "Book / Monograph", value: "book" },
      { label: "Institutional Report / Survey", value: "report" },
      { label: "Website / Science Journalism", value: "site" },
    ],
  },
  {
    name: "evidenceLevel",
    type: "select",
    required: true,
    defaultValue: "primary_research",
    options: [
      { label: "Primary Empirical Research", value: "primary_research" },
      {
        label: "Meta-Analysis / Systematic Review",
        value: "review_meta_analysis",
      },
      { label: "Academic Book / Foundation Text", value: "book" },
      {
        label: "Secondary Scientific Explanation",
        value: "secondary_explanation",
      },
    ],
  },
  {
    name: "title",
    type: "text",
    required: true,
  },
  {
    name: "authorOrg",
    type: "text",
    required: true,
    label: "Author(s) or Organization",
  },
  {
    name: "year",
    type: "text",
    required: true,
  },
  {
    name: "urlDoi",
    type: "text",
    label: "URL or DOI Link",
  },
  {
    name: "note",
    type: "textarea",
    label: "Relevance Note / Context",
  },
];
