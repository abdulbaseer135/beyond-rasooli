import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import en from '../src/messages/en.json';
import ps from '../src/messages/ps.json';
import fa from '../src/messages/fa.json';
const findings:{file:string;line:number;text:string}[]=[];
function scan(dir:string){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory()){if(entry.name==='styleguide')continue;scan(file);continue}if(!file.endsWith('.tsx'))continue;const content=fs.readFileSync(file,'utf8');const tree=ts.createSourceFile(file,content,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);function report(node:ts.Node,text:string){if(!/[A-Za-z\u0600-\u06ff]/.test(text.replace(/&(?:#[0-9]+|#x[a-f0-9]+|[a-z]+);/gi,'')))return;const line=tree.getLineAndCharacterOfPosition(node.getStart()).line+1;findings.push({file,line,text:text.trim().slice(0,100)})}function visit(node:ts.Node){if(ts.isJsxText(node)&&node.getText().trim())report(node,node.getText());if(ts.isJsxAttribute(node)&&['alt','aria-label','placeholder','title'].includes(node.name.getText())&&node.initializer&&ts.isStringLiteral(node.initializer))report(node,node.initializer.text);ts.forEachChild(node,visit)}visit(tree)}}
scan('src/app/[locale]');scan('src/components');
const keys=Object.entries(en).flatMap(([ns,values])=>Object.keys(values).map(key=>[ns,key]));for(const [locale,dictionary]of [['ps',ps],['fa',fa]]as const){const missing=keys.filter(([ns,key])=>!(dictionary as Record<string,Record<string,string>>)[ns]?.[key]);console.log(`${locale}: ${missing.length} bundled starter keys missing. CMS review status must be checked separately.`)}
for(const finding of findings)console.log(`${finding.file}:${finding.line}: ${finding.text}`);
console.log(`Static public JSX/label scan: ${findings.length?'FAIL':'PASS'} (${findings.length} findings). Hidden styleguide sample content is excluded. Dynamic strings, CMS schema labels and third-party admin translations still require review.`);
if(findings.length)process.exitCode=1;
