import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const templatePath=process.argv[2]||path.join(root,'screenshot-cheatsheet.html');
const template=fs.readFileSync(templatePath,'utf8');
const style=template.match(/<style>[\s\S]*?<\/style>/)?.[0];
if(!style)throw new Error('Template does not contain a <style> block');
function expression(startMarker,endMarker,name){const a=source.indexOf(startMarker),b=source.indexOf(endMarker,a);if(a<0||b<0)throw new Error(`Could not locate ${name}`);return new Function(`${source.slice(a,b)}\nreturn ${name}`)()}
const tutorials=expression('const TUTORIALS = [','\n\n\nconst CATEGORY_ORDER','TUTORIALS');
const captured=expression('const CAPTURED = {','\n/* how old a screenshot','CAPTURED');
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const refs=[],byGuide=new Map();
function add(file,platform,tutorial,step,index,url){const ref={file:`img/${file}.png`,base:file,platform,tutorial,step,index:index+1,url:url||''};refs.push(ref);if(!byGuide.has(tutorial.id))byGuide.set(tutorial.id,[]);byGuide.get(tutorial.id).push(ref)}
for(const tutorial of tutorials.filter(t=>t.status==='ready'))tutorial.steps.forEach((step,index)=>{
  const dual=!!((step.app&&(step.app.body||step.app.url))||step.appUrl||step.appShot);
  if(step.shot){
    if(dual){add(`${step.shot}-desktop`,'desktop',tutorial,step,index,step.url);add(`${step.appShot||step.shot}-app`,'app',tutorial,step,index,step.app?.url||step.appUrl||step.url)}
    else add(step.shot,'single',tutorial,step,index,step.url);
  }else if(step.img)add(String(step.img).replace(/^img\//,'').replace(/\.png$/,''),'single',tutorial,step,index,step.url);
});
const firstByFile=new Map();for(const ref of refs)if(!firstByFile.has(ref.file))firstByFile.set(ref.file,ref);
const unique=[...firstByFile.values()],guideEntries=[...byGuide.entries()];
function row(ref){
  const primary=firstByFile.get(ref.file)===ref,klass=primary?'':' class="reuse"',icon=primary?'<input type="checkbox" class="shot">':'↺';
  const p=ref.platform==='desktop'?'<span class="pill desk">🖥 Desktop</span>':ref.platform==='app'?'<span class="pill app">📱 App</span>':'<span class="pill single">Single version</span>';
  return `<tr${klass} data-guide="${esc(ref.tutorial.id)}" data-file="${esc(ref.file)}"><td class="cchk">${icon}</td><td class="cnum">${ref.index}</td><td class="cplat">${p}</td><td class="cfile"><code>${esc(ref.file)}</code><button class="copy" data-fn="${esc(ref.file)}" title="Copy filename">copy</button></td><td class="cwhat"><strong>${esc(ref.step.title)}</strong>${ref.url?`<span class="curl">${ref.platform==='app'?'':'at '}<code>${esc(ref.url)}</code></span>`:''}${primary?'':`<span class="curl">Reuses a screenshot already listed above.</span>`}</td></tr>`;
}
function section([id,items]){
  const tutorial=items[0].tutorial,provider=tutorial.brokerage||'General',badge=provider==='Fidelity'?'fid':provider==='Schwab'?'sch':'gen';
  const files=[...new Set(items.map(x=>x.file))],platforms=new Set(items.map(x=>x.platform));
  const tag=platforms.has('desktop')&&platforms.has('app')?'desktop + app':platforms.has('single')?'single-version':'device-specific';
  return `<section class="guide"><div class="ghead"><span class="gbadge ${badge}">${esc(provider)}</span><h2>${esc(tutorial.title)}</h2><span class="dualtag">${tag}</span><span class="gcount"><span class="gdone" data-guide="${esc(id)}">0</span>/${files.length} captured</span></div><div class="tscroll"><table><thead><tr><th class="cchk"></th><th class="cnum">Step</th><th class="cplat">For</th><th class="cfile">Save your screenshot as</th><th class="cwhat">What it should show</th></tr></thead><tbody>${items.map(row).join('')}</tbody></table></div><div class="swipehint">Swipe the table sideways to see the filename and description →</div></section>`;
}
const tree=unique.map((r,i)=>`${i===unique.length-1?'└─':'├─'} <span class="fn">${esc(r.file.replace(/^img\//,''))}</span>`).join('\n');
const capJSON=JSON.stringify(captured,null,2);
const html=`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Personal Finance PathFinder — Screenshot cheat sheet</title>${style}<style>.pill.single{background:#EEE8F8;color:#60428B}.summary{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}.summary span{background:#fff;border:1px solid var(--line);border-radius:999px;padding:6px 11px;font-size:12px;font-weight:700;color:var(--ink)}</style></head><body>
<header><div class="hwrap"><div class="logo"><span class="mark">PF<sup>2</sup></span> Personal Finance PathFinder</div><h1>Screenshot cheat sheet</h1><p>The current consolidated screenshot plan, organized by guide and device. Check files off as you capture them; progress saves in this browser.</p><div class="bigprog"><span><span id="allDone" style="color:#fff;font-weight:800">0</span> of ${unique.length} captured</span><span class="bigbar"><i id="allBar"></i></span></div></div></header>
<main><div class="howto"><h3>How to use this</h3><ol><li>Pick a device pass first—capture all <b>desktop</b> files, then all <b>app</b> files.</li><li>Save each file with the <b>exact name</b> shown. Use <code>copy</code> and remove account numbers or personal details.</li><li>Put every file in the app's <code>img/</code> folder. Device suffixes keep desktop and app versions separate.</li><li>Commit the image folder to GitHub, verify the Cloudflare preview, then promote it to production.</li></ol></div>
<div class="dualnote"><b>Consolidated plan:</b> Only designated visual checkpoints appear here. Steps without a row intentionally use text guidance and do not require their own screenshot. The ↺ symbol marks a checkpoint that reuses a filename captured elsewhere.</div>
<div class="summary"><span>${guideEntries.length} guides with screenshots</span><span>143 visual checkpoints</span><span>${unique.filter(x=>x.platform==='desktop').length} desktop files</span><span>${unique.filter(x=>x.platform==='app').length} app files</span><span>${unique.filter(x=>x.platform==='single').length} single-version files</span></div>
${guideEntries.map(section).join('\n')}
<div class="tree"><h3>Your img/ folder when complete</h3><pre>img/\n${tree}</pre></div><div class="foot">${unique.length} unique screenshot files · ${guideEntries.length} guides with screenshots · text-only guides need none.<br><button class="reset" id="reset">Reset all checkboxes</button></div></main>
<script>const CAPTURED=${capJSON};const STALE_MONTHS=9;const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function shotBase(fn){return String(fn||'').replace(/^img\\//,'').replace(/\\.png$/,'')}function monthsSince(iso){const c=new Date(iso+'T00:00:00');if(isNaN(c))return null;const n=new Date();let m=(n.getFullYear()-c.getFullYear())*12+(n.getMonth()-c.getMonth());if(n.getDate()<c.getDate())m--;return m}
function applyManifest(){document.querySelectorAll('tr[data-file]').forEach(row=>{const d=CAPTURED[shotBase(row.dataset.file)];if(!d||row.querySelector('.capbadge'))return;const c=new Date(d+'T00:00:00'),m=monthsSince(d),stale=m!==null&&m>STALE_MONTHS,b=document.createElement('span');b.className='capbadge'+(stale?' stale':'');b.textContent='shot '+MON[c.getMonth()]+' '+c.getFullYear()+(stale?' · recheck':'');row.querySelector('.cfile code').after(b);row.classList.add('manifest');const box=row.querySelector('input.shot');if(box){box.checked=true;box.disabled=true;box.title='Recorded in the manifest'}})}
const KEY='pf2-cheatsheet-v2';function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}function save(o){try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}}let state=load();const boxes=[...document.querySelectorAll('input.shot')],total=${unique.length};
function captured(file){return !!state[file]||!!CAPTURED[shotBase(file)]}function refresh(){let all=0;const uniqueFiles=new Set(),per={};document.querySelectorAll('tr[data-file]').forEach(row=>{const file=row.dataset.file,on=captured(file),guide=row.dataset.guide;row.classList.toggle('captured',on);if(!uniqueFiles.has(file)){uniqueFiles.add(file);if(on)all++}per[guide]??={files:new Set(),done:new Set()};per[guide].files.add(file);if(on)per[guide].done.add(file)});boxes.forEach(b=>b.checked=captured(b.closest('tr').dataset.file));document.querySelectorAll('.gdone').forEach(el=>el.textContent=per[el.dataset.guide]?.done.size||0);document.getElementById('allDone').textContent=all;document.getElementById('allBar').style.width=(all/total*100)+'%'}
boxes.forEach(b=>b.addEventListener('change',()=>{const k=b.closest('tr').dataset.file;if(b.checked)state[k]=1;else delete state[k];save(state);refresh()}));document.querySelectorAll('.copy').forEach(btn=>btn.addEventListener('click',async()=>{const fn=btn.dataset.fn;try{await navigator.clipboard.writeText(fn)}catch(e){const t=document.createElement('textarea');t.value=fn;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}const old=btn.textContent;btn.textContent='copied';btn.classList.add('copied');setTimeout(()=>{btn.textContent=old;btn.classList.remove('copied')},1200)}));document.getElementById('reset').addEventListener('click',()=>{state={};save(state);refresh()});applyManifest();refresh();<\/script></body></html>`;
fs.writeFileSync(path.join(root,'screenshot-cheatsheet.html'),html);
console.log(`Wrote screenshot-cheatsheet.html with ${unique.length} files across ${guideEntries.length} guides.`);
