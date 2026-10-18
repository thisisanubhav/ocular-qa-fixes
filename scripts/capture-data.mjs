import {connect} from './cdp.mjs';import {writeFile} from 'node:fs/promises';
const c=await connect();const data={};
for(const [kind,metrics] of Object.entries({diarization:['DER','DER ±0.25 s collar','JER','Speaker Count'],stt:['WER','CER']})){
 await c.navigate(`https://www.useocular.com/converse/${kind}`);await c.wait('document.querySelector("ol li")');data[kind]=[];
 for(const metric of metrics){await c.evaluate(`Array.from(document.querySelectorAll('button')).find(e=>e.textContent.trim()===${JSON.stringify(metric)}).click()`);await new Promise(r=>setTimeout(r,400));
 const rows=await c.evaluate(`Array.from(document.querySelector('ol').querySelectorAll('li')).map(e=>({name:e.querySelector('a')?.textContent.trim(),url:e.querySelector('a')?.href,score:Number(e.innerText.match(/([\\d.]+)%/)?.[1])})).filter(e=>e.name)`);
 for(const row of rows){let model=data[kind].find(m=>m.name===row.name);if(!model){model={name:row.name,url:row.url,scores:{}};data[kind].push(model)}model.scores[metric]=row.score;}
 }
}
await writeFile('src/benchmarks.json',JSON.stringify(data,null,2));console.log(Object.fromEntries(Object.entries(data).map(([k,v])=>[k,v.length])));c.close();
