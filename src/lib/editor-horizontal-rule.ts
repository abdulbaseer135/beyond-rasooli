import { HorizontalRuleFeature } from "@payloadcms/richtext-lexical";

export function horizontalRuleFeature() {
  const provider = HorizontalRuleFeature();
  const feature = provider.feature;
  const ClientFeature = "/src/components/admin/HorizontalRuleFeatureClient#HorizontalRuleFeatureClient";
  return {
    ...provider,
    feature: typeof feature === "function"
      ? async (args: Parameters<typeof feature>[0]) => ({ ...await feature(args), ClientFeature })
      : { ...feature, ClientFeature },
  };
}
