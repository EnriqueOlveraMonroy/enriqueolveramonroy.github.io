/** Dependency-free checks. Run from any directory: node qa/check-site.mjs */
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>readFileSync(resolve(root,name),'utf8');
const html=read('index.html'),js=read('app.js');
const results=[];
function check(name,ok){results.push({name,passed:!!ok});}
const syntax=spawnSync(process.execPath,['--check',resolve(root,'app.js')]);
check('JavaScript parses',syntax.status===0);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
check('Unique HTML IDs',new Set(ids).size===ids.length);
check('One primary heading',(html.match(/<h1\b/g)||[]).length===1);
check('English default',/<html\s+lang="en"/.test(html));
const local=[];
for(const m of html.matchAll(/\b(?:src|href|srcset)="([^"]+)"/g)){
 const value=m[1];if(value.startsWith('#')){check(`Anchor ${value}`,ids.includes(value.slice(1)));continue;}
 if(/^[a-z]+:/i.test(value))continue;
 const path=decodeURIComponent(value.split(/[?#]/)[0]);local.push(path);
 check(`Local resource ${path}`,!path.startsWith('/')&&existsSync(resolve(root,path)));
}
const prefix=js.slice(0,js.indexOf('const originals'));
const content=vm.runInNewContext(prefix+';({spanish,portfolioProjects,imageContent})',{}, {timeout:1000});
for(const key of new Set([...html.matchAll(/data-i18n="([^"]+)"/g)].map(m=>m[1])))check(`Spanish translation ${key}`,Object.hasOwn(content.spanish,key));
for(const [key,value] of Object.entries(content.imageContent))check(`Preview asset ${key}`,existsSync(resolve(root,value.src)));
check('Six notebook projects',content.portfolioProjects.length===6);
check('Eleven projects in static HTML',(html.match(/data-category="/g)||[]).length===11);
for(const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g))check('External link protects opener',/rel="[^"]*noopener/.test(match[0]));
check('No inline event handlers',!/\son[a-z]+\s*=/.test(html));
const csp=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1]||'';
check('CSP present before scripts',!!csp&&html.indexOf('Content-Security-Policy')<html.indexOf('<script'));
check('CSP has no unsafe script exceptions',!csp.includes('unsafe-inline')&&!csp.includes('unsafe-eval'));
const structured=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
check('Structured data uses verified identity',JSON.parse(structured).mainEntity.name==='Enrique Olvera Monroy');
check('Structured data CSP hash matches',csp.includes('sha256-'+createHash('sha256').update(structured).digest('base64')));
check('Canonical points to confirmed public site',html.includes('rel="canonical" href="https://enriqueolveramonroy.github.io/"'));
check('No local development URL in page',!/(localhost|127\.0\.0\.1)/.test(html));
check('robots.txt includes sitemap',read('robots.txt').includes('Sitemap: https://enriqueolveramonroy.github.io/sitemap.xml'));
check('Sitemap contains canonical URL',read('sitemap.xml').includes('<loc>https://enriqueolveramonroy.github.io/</loc>'));
check('404 is not indexable',read('404.html').includes('content="noindex"'));
check('Static hosting marker present',existsSync(resolve(root,'.nojekyll')));
check('CV has a PDF signature',readFileSync(resolve(root,'assets/enrique-olvera-cv.pdf')).subarray(0,5).toString()==='%PDF-');
const failed=results.filter(r=>!r.passed);
console.log(JSON.stringify({checks:results.length,passed:results.length-failed.length,failed,uniqueLocalResources:new Set(local).size},null,2));
if(failed.length)process.exitCode=1;
