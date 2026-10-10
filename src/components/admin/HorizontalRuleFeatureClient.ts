"use client";

import {
  $createHorizontalRuleNode,
  HorizontalRuleNode,
  HorizontalRuleFeatureClient as PayloadHorizontalRuleFeatureClient,
} from "@payloadcms/richtext-lexical/client";

// Payload 3.90.2 inherits the server node's HTML importer. Pasting <hr>
// therefore creates a server node in an editor registered with the client node.
// Keep the same registered class and correct only its DOM conversion.
HorizontalRuleNode.importDOM = () => ({
  hr: () => ({
    conversion: () => ({ node: $createHorizontalRuleNode() }),
    priority: 0,
  }),
});

export const HorizontalRuleFeatureClient = PayloadHorizontalRuleFeatureClient;
