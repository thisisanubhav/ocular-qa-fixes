import {execFileSync} from 'node:child_process';
export async function connect(){
 const pane=process.env.OCULAR_PANE||'pane-5aab4818-4270-40cd-9462-0d0fd429ad8e';
 const info=JSON.parse(execFileSync('superset',['browser','cdp','--workspace',process.env.SUPERSET_WORKSPACE_ID,'--pane',pane,'--json'],{encoding:'utf8'}));
 const ws=new WebSocket(info.url); await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});let id=0;
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;const t=setTimeout(()=>reject(new Error(`Timeout: ${method}`)),30000);const h=e=>{const m=JSON.parse(e.data);if(m.id!==n)return;clearTimeout(t);ws.removeEventListener('message',h);m.error?reject(new Error(m.error.message)):resolve(m.result)};ws.addEventListener('message',h);ws.send(JSON.stringify({id:n,method,params}))});
 await send('Page.enable');await send('Runtime.enable');
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text);return r.result.value};
 const wait=async expression=>{for(let i=0;i<100;i++){if(await evaluate(`Boolean(${expression})`))return;await new Promise(r=>setTimeout(r,100))}throw new Error(`Not ready: ${expression}`)};
 const navigate=async url=>{await send('Page.navigate',{url});await wait('document.readyState === "complete"');};
 const viewport=(width,height=900)=>send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
 return {send,evaluate,wait,navigate,viewport,close:()=>ws.close()};
}
