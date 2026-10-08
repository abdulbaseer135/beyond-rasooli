# Interface starter wording

Pashto and Dari dictionaries include generated starter wording for the new UI keys. These are AI drafts, not founder-approved translations. The public loader still uses CMS values first and the bundled English dictionary as fallback; it never silently treats bundled Pashto/Dari starter wording as CMS-approved text.

Run npm run seed after schema migration to create missing CMS records with ai_draft status. The review report includes Missing records even before seeding, and edits reset approval. The founder and native reviewers must check wording, terminology, Dari usage, ICU placeholders, and long-label layouts, then approve each locale in the CMS/review report. Run npm run check-launch; dictionary completeness alone is not a launch approval.
