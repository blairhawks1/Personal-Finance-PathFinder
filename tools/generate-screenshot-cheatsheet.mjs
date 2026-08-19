import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
function expression(startMarker,endMarker,name){
  const start=source.indexOf(startMarker),end=source.indexOf(endMarker,start);
  if(start<0||end<0)throw new Error(`Could not locate ${name} in index.html`);
  return new Function(`${source.slice(start,end)}\nreturn ${name}`)();
}
const tutorials=expression('const TUTORIALS = [','\n\n\nconst CATEGORY_ORDER','TUTORIALS');
const captured=expression('const CAPTURED = {','\n/* how old a screenshot','CAPTURED');
const references=new Map();
const add=(file,platform,tutorial,step,index)=>{
  const key=`${file}.png`,row=references.get(key)||{file:key,platform,provider:tutorial.brokerage||'General',refs:[]};
  row.refs.push({guideId:tutorial.id,guide:tutorial.title,step:index+1,goal:step.title});references.set(key,row);
};
for(const tutorial of tutorials.filter(t=>t.status==='ready')){
  tutorial.steps.forEach((step,index)=>{
    const dual=!!((step.app&&(step.app.body||step.app.url))||step.appUrl||step.appShot);
    if(step.shot){
      if(dual){add(`${step.shot}-desktop`,'Desktop',tutorial,step,index);add(`${step.appShot||step.shot}-app`,'App',tutorial,step,index)}
      else add(step.shot,'Single',tutorial,step,index);
    }else if(step.img){
      add(String(step.img).replace(/^img\//,'').replace(/\.png$/,''),'Single',tutorial,step,index);
    }
  });
}
const rows=[...references.values()].sort((a,b)=>a.provider.localeCompare(b.provider)||a.file.localeCompare(b.file));
const quote=value=>`"${String(value??'').replaceAll('"','""')}"`;
const headers=['Priority','Status','Filename','Platform','Provider','Guide ID','Guide title','Step','What to capture','Reused by','Manifest capture date'];
const csv=[headers.map(quote).join(',')];
for(const row of rows){
  const first=row.refs[0],base=row.file.replace(/\.png$/,''),date=captured[base]||'',status=date?'Captured in manifest — verify asset':'Needed';
  csv.push([
    date?'Keep current':'Capture',status,row.file,row.platform,row.provider,first.guideId,first.guide,first.step,first.goal,
    row.refs.length>1?row.refs.slice(1).map(r=>`${r.guideId} step ${r.step}`).join('; '):'',date
  ].map(quote).join(','));
}
fs.writeFileSync(path.join(root,'SCREENSHOT_CHEATSHEET.csv'),csv.join('\n')+'\n');
const counts={
  guides:tutorials.filter(t=>t.status==='ready').length,
  checkpoints:new Set(rows.flatMap(r=>r.refs.map(x=>`${x.guideId}:${x.step}`))).size,
  total:rows.length,
  desktop:rows.filter(r=>r.platform==='Desktop').length,
  app:rows.filter(r=>r.platform==='App').length,
  single:rows.filter(r=>r.platform==='Single').length,
  captured:rows.filter(r=>captured[r.file.replace(/\.png$/,'')]).length
};
const md=`# Screenshot Cheatsheet\n\nGenerated from the current \`TUTORIALS\` and \`CAPTURED\` data in \`index.html\`. Run \`node tools/generate-screenshot-cheatsheet.mjs\` after guide changes.\n\n## Current inventory\n\n- Ready guides: ${counts.guides}\n- Referenced visual checkpoints: ${counts.checkpoints}\n- Unique screenshot files: ${counts.total}\n- Desktop files: ${counts.desktop}\n- App files: ${counts.app}\n- Single-version files: ${counts.single}\n- Entries marked captured in the manifest: ${counts.captured}\n\nThe current app now matches the consolidated **143-checkpoint** selection. Those checkpoints resolve to **${counts.total} unique filenames** in the current code. The older handoff's 253-file prose count is two lower than the filenames produced by its own consolidated mapping; this sheet uses the actual mapping.\n\n## How to use the CSV\n\n1. Filter **Priority** to \`Capture\`.\n2. Work by **Provider**, then **Guide title**, then **Step**.\n3. Save the image using **Filename** exactly under the app's \`img/\` folder.\n4. Check **Reused by** before recapturing a screen shared by more than one step.\n5. After adding files, update the \`CAPTURED\` manifest in \`index.html\` with the capture date and regenerate this sheet.\n\nThe repository currently does not include the screenshot image assets themselves. A manifest date means the app records that a capture happened; it does not prove the corresponding file is present in this repository.\n`;
fs.writeFileSync(path.join(root,'SCREENSHOT_CHEATSHEET.md'),md);
console.log(`Wrote ${rows.length} screenshot rows.`);
