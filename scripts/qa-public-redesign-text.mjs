import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import assert from 'node:assert/strict';

const files = [...new Set([...execFileSync('git', ['diff', '--name-only'], { encoding: 'utf8' }).trim().split(/\r?\n/), 'src/components/cards/TopicCard.tsx'])].filter(file => file.endsWith('.tsx'));
const findings = [];
for (const file of files) {
  const tree = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const report = (node, text) => {
    if (/[A-Za-z\u0600-\u06ff]/.test(text.replace(/&(?:#[0-9]+|#x[a-f0-9]+|[a-z]+);/gi, ''))) findings.push({ file, line: tree.getLineAndCharacterOfPosition(node.getStart()).line + 1, text });
  };
  const visit = node => {
    if (ts.isJsxText(node) && node.getText().trim()) report(node, node.getText());
    if (ts.isJsxAttribute(node) && ['alt', 'aria-label', 'placeholder', 'title'].includes(node.name.getText()) && node.initializer && ts.isStringLiteral(node.initializer)) report(node, node.initializer.text);
    ts.forEachChild(node, visit);
  };
  visit(tree);
}
assert.equal(findings.length, 0, JSON.stringify(findings));
console.log(`PASS: ${files.length} redesigned TSX files have zero literal interface-copy findings.`);
const restricted = execFileSync('git', ['diff', '--name-only', '--', 'src/components/admin', 'src/app/(payload)', 'src/app/api', 'src/collections', 'src/globals', 'src/lib', 'src/payload.config.ts', 'src/components/forms/EditorApplicationForm.tsx', 'src/app/[locale]/apply-as-editor', 'src/app/[locale]/review-report', 'src/app/[locale]/translation-review'], { encoding: 'utf8' }).trim();
assert.equal(restricted, '', `Restricted files changed: ${restricted}`);
console.log('PASS: admin, registration, review, CMS, backend and database source files remain unchanged.');
