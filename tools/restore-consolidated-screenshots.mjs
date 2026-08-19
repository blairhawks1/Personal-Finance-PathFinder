import fs from 'node:fs';
import cp from 'node:child_process';

const file=new URL('../index.html',import.meta.url);
const currentSource=fs.readFileSync(file,'utf8');
const consolidatedSource=cp.execFileSync('git',['show','f0533437:index.html'],{encoding:'utf8',maxBuffer:20_000_000});
function tutorials(source){
  const a=source.indexOf('const TUTORIALS = ['),b=source.indexOf('\n\n\nconst CATEGORY_ORDER',a);
  if(a<0||b<0)throw new Error('Could not locate TUTORIALS');
  return {a,b,data:new Function(`${source.slice(a,b)}\nreturn TUTORIALS`)()};
}
const current=tutorials(currentSource),old=tutorials(consolidatedSource);
const oldById=new Map(old.data.map(t=>[t.id,t]));
const decisions=[];
for(const tutorial of current.data){
  const prior=oldById.get(tutorial.id),used=new Set();
  tutorial.steps.forEach((step,index)=>{
    let oldIndex=prior?.steps.findIndex((candidate,i)=>!used.has(i)&&candidate.title===step.title)??-1;
    if(oldIndex<0&&prior?.steps[index])oldIndex=index;
    if(oldIndex>=0)used.add(oldIndex);
    const oldStep=oldIndex>=0?prior.steps[oldIndex]:null;
    for(const key of Object.keys(step).filter(key=>(key==='shot'||key==='appShot')&&typeof step[key]==='string'))decisions.push({key,value:step[key],keep:oldStep?.[key]===step[key],guide:tutorial.id,step:index+1});
  });
}
const tutorialText=currentSource.slice(current.a,current.b);
let cursor=0,decisionIndex=0,output='';
const propertyLine=/^[ \t]*(shot|appShot):"([^"]+)",?\r?\n/gm;
for(const match of tutorialText.matchAll(propertyLine)){
  const decision=decisions[decisionIndex++];
  if(!decision||decision.key!==match[1]||decision.value!==match[2])throw new Error(`Property sequence mismatch at ${match[1]}:${match[2]}; expected ${decision?.key}:${decision?.value} for ${decision?.guide} step ${decision?.step}`);
  output+=tutorialText.slice(cursor,match.index);
  if(decision.keep)output+=match[0];
  cursor=match.index+match[0].length;
}
output+=tutorialText.slice(cursor);
if(decisionIndex!==decisions.length)throw new Error(`Only matched ${decisionIndex} of ${decisions.length} screenshot properties`);
const next=currentSource.slice(0,current.a)+output+currentSource.slice(current.b);
fs.writeFileSync(file,next);
console.log(`Removed ${decisions.filter(x=>!x.keep).length} legacy screenshot assignments; kept ${decisions.filter(x=>x.keep).length}.`);
