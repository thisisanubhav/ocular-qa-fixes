import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {connect} from './cdp.mjs';
const c=await connect();const results=[];const errors=[];const requests=[];
c.on('Runtime.exceptionThrown',event=>errors.push(event.exceptionDetails.text));
c.on('Network.requestWillBeSent',event=>{if(event.request.method==='POST')requests.push({url:event.request.url,payload:JSON.parse(event.request.postData||'{}')});});
await c.send('Network.enable');
const check=async(name,expression)=>{const value=await c.evaluate(expression);assert.ok(value,`${name}: ${JSON.stringify(value)}`);results.push({name,passed:true});};
const commit=file=>{execFileSync('git',['add','--',file]);try{execFileSync('git',['diff','--cached','--quiet','--',file]);}catch{execFileSync('git',['commit','-m',`Capture ${file}`],{stdio:'ignore'});}};
const save=async(file,content)=>{await writeFile(file,content);commit(file);};
const shot=async name=>{await c.evaluate('document.fonts.ready.then(()=>true)');const r=await c.send('Page.captureScreenshot',{format:'png'});await save(`evidence/after/${name}.png`,Buffer.from(r.data,'base64'));};
const go=async route=>{await c.navigate('http://localhost:3000'+route);await c.wait('document.querySelector("#main") && document.querySelector(".site-footer")');};
const key=async(key,code=key,text)=>{await c.send('Input.dispatchKeyEvent',{type:'keyDown',key,code,...(text?{text,unmodifiedText:text}:{}),windowsVirtualKeyCode:key==='Enter'?13:key==='Tab'?9:key==='Escape'?27:0});await c.send('Input.dispatchKeyEvent',{type:'keyUp',key,code});};
try{
 for(const width of [320,390,768,1024,1440]){
  await c.viewport(width,width===768?1024:900);
  for(const [route,name] of [['/','home'],['/human-data/marketplace','marketplace'],['/contact?subject=Sample%20request%3A%20Hindi%20Full-Duplex%20Conversational%20Dataset','contact'],['/careers','careers'],['/converse/diarization','diarization'],['/converse/stt','stt']]){
   await go(route);
   await check(`${name} fits ${width}px`,`document.documentElement.scrollWidth <= innerWidth`);
   await check(`${name} primary CTA visible at ${width}px`,`(()=>{const r=document.querySelector('.header-cta').getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth})()`);
   await check(`${name} named home links at ${width}px`,`document.querySelectorAll('a[aria-label="Ocular AI — Home"]').length===2`);
   if(name==='home'){await c.evaluate(`document.querySelector('[data-slide="2"]').click()`);await check(`Diarization home counts at ${width}px`,`document.querySelector('.hero-count').textContent.includes('12 models') && document.querySelector('.count-badge').textContent==='12'`);}
   if(name==='contact')await check(`Visible editable context at ${width}px`,`document.querySelector('[name="subject"]').value==='Sample request: Hindi Full-Duplex Conversational Dataset' && !document.querySelector('[name="subject"]').readOnly`);
   if(name==='diarization')await check(`12 leaderboard models at ${width}px`,`document.querySelector('[data-model-count]').textContent==='12' && document.querySelectorAll('.model-list li').length===12`);
   await shot(`${name}-${width}`);
  }
  await go('/careers');
  if(width<1100){
   await c.evaluate(`document.querySelector('.menu-toggle').focus()`);await key('Enter','Enter','\r');
   await check(`Keyboard opens menu at ${width}px`,`document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='true'`);
   await check(`Careers is reachable at ${width}px`,`(()=>{const r=document.querySelector('.careers-link').getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth})()`);
   await c.evaluate(`document.querySelector('[aria-controls="nav-Products"]').focus()`);await key('Enter','Enter','\r');
   await check(`Keyboard product submenu at ${width}px`,`!document.querySelector('#nav-Products').hidden`);
   if(width===768)await shot('tablet-menu-open');
   await key('Escape');await check(`Escape returns submenu focus ${width}px`,`document.activeElement.getAttribute('aria-controls')==='nav-Products' && document.querySelector('#nav-Products').hidden`);
   await key('Escape');await check(`Escape closes compact menu ${width}px`,`document.activeElement.classList.contains('menu-toggle') && document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false'`);
  }else{
   await c.evaluate(`document.querySelector('[aria-controls="nav-Products"]').focus()`);await key('Enter','Enter','\r');await key('Tab');
   await check('Desktop submenu keyboard traversal',`document.activeElement.textContent==='All Products'`);await key('Escape');
  }
 }
 await c.viewport(1440,900);await go('/');
 const ax=await c.send('Accessibility.getFullAXTree');const logoLinks=ax.nodes.filter(n=>n.role?.value==='link'&&n.name?.value==='Ocular AI — Home');assert.equal(logoLinks.length,2);results.push({name:'Accessibility tree exposes both home links by name',passed:true});
 await save('evidence/after/accessibility.json',JSON.stringify({homeLinks:logoLinks.map(n=>({role:n.role.value,name:n.name.value})),unnamedLinks:ax.nodes.filter(n=>n.role?.value==='link'&&!n.name?.value).length},null,2));
 await c.evaluate(`document.querySelector('.skip-link').focus()`);await key('Enter','Enter','\r');await check('Skip link moves focus to main',`document.activeElement.id==='main'`);
 await go('/human-data/marketplace');await check('Marketplace starts with six cards',`document.querySelectorAll('.dataset-card').length===6`);
 const pageOne=await c.evaluate(`Array.from(document.querySelectorAll('.dataset-card h2')).map(e=>e.textContent)`);
 await c.evaluate(`document.querySelector('[data-page="2"]').click()`);const pageTwo=await c.evaluate(`Array.from(document.querySelectorAll('.dataset-card h2')).map(e=>e.textContent)`);assert.equal(pageTwo.length,6);assert.ok(pageTwo.every(n=>!pageOne.includes(n)));results.push({name:'Marketplace second page contains next six distinct datasets',passed:true});
 await c.evaluate(`document.querySelector('[data-language="Hindi"]').click()`);await check('Language filter resets pagination',`document.querySelectorAll('.dataset-card').length===1 && document.querySelector('.dataset-card h2').textContent.startsWith('Hindi') && document.querySelector('[aria-current="page"]').textContent==='1'`);await shot('marketplace-hindi-filter');
 await c.evaluate(`document.querySelector('.dataset-card .text-link').click()`);await c.wait('document.querySelector("#contact-form")');await check('Marketplace request sample link carries visible subject',`document.querySelector('[name="subject"]').value==='Sample request: Hindi Full-Duplex Conversational Dataset'`);
 await c.evaluate(`document.querySelector('[type="submit"]').click()`);await check('Required form validation blocks empty submission',`document.querySelectorAll('[aria-invalid="true"]').length>=5 && document.activeElement.name==='firstName'`);
 const fields={firstName:'QA',lastName:'Tester',email:'qa@example.test',jobTitle:'Researcher',company:'Local QA',companyType:'Startup',subject:'Edited Hindi samples — QA only',message:'Local browser verification. Do not deliver.'};
 await c.evaluate(`Object.entries(${JSON.stringify(fields)}).forEach(([name,value])=>{const el=document.querySelector('[name="'+name+'"]');el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));});document.querySelector('[name="useCases"]').click();document.querySelector('[type="submit"]').click();`);
 await c.wait(`document.querySelector('#form-status').textContent.includes('Test successful')`);
 assert.ok(requests.length);const sent=requests.at(-1);assert.equal(sent.url,'http://localhost:3000/api/contact');assert.equal(sent.payload.subject,fields.subject);assert.ok(sent.payload.interests.includes('Browse our Off-the-shelf Datasets'));assert.equal(sent.payload.message,fields.message);results.push({name:'Edited context and selections reach the mock API payload',passed:true});
 await save('evidence/after/mock-payload.json',JSON.stringify(sent,null,2));await shot('contact-mock-success');
 await c.evaluate(`window.originalFetch=window.fetch;window.fetch=async()=>new Response('{}',{status:503});document.querySelector('[type="submit"]').click();`);await c.wait(`document.querySelector('#form-status').textContent.includes('could not complete')`);await check('Failed submission retains edits and enables retry',`document.querySelector('[name="subject"]').value===${JSON.stringify(fields.subject)} && !document.querySelector('[type="submit"]').disabled`);
 await c.evaluate('window.fetch=window.originalFetch');
 for(const slug of ['hi-fi','tts-voices','audiovisual','proprietary','open-source']){
  await go('/human-data/'+slug);const subject=await c.evaluate(`new URL(document.querySelector('.page-heading .button').href).searchParams.get('subject')`);await c.evaluate(`document.querySelector('.page-heading .button').click()`);await c.wait('document.querySelector("#contact-form")');assert.equal(await c.evaluate(`document.querySelector('[name="subject"]').value`),subject);results.push({name:`${slug} inquiry context preserved`,passed:true});
 }
 await go('/contact');await check('Direct contact starts with an empty editable subject',`document.querySelector('[name="subject"]').value===''`);
 await go('/contact?subject='+encodeURIComponent('<img src=x onerror=alert(1)>'));await check('Query context is treated as text',`document.querySelector('[name="subject"]').value==='<img src=x onerror=alert(1)>' && !document.querySelector('.context-field img')`);
 await go('/human-data/marketplace?q=no-matching-dataset');await check('Empty catalogue search is recoverable',`document.querySelector('.empty-state').textContent.includes('No datasets found')`);await c.evaluate(`document.querySelector('#clear-filters').click()`);await check('Clear filter restores catalogue',`document.querySelectorAll('.dataset-card').length===6`);
 for(const kind of ['diarization','stt']){
  await go('/converse/'+kind);const before=await c.evaluate(`document.querySelector('.model-list').innerText`);const metric=kind==='stt'?'CER':'JER';await c.evaluate(`document.querySelector('[data-metric="${metric}"]').click()`);assert.notEqual(await c.evaluate(`document.querySelector('.model-list').innerText`),before);results.push({name:`${kind} metric control updates ranked scores`,passed:true});
  await c.evaluate(`const select=document.querySelector('[name="modelAccess"]');select.value='Open Source';select.dispatchEvent(new Event('change',{bubbles:true}));`);await check(`${kind} model access filter`, `document.querySelectorAll('.model-list li').length>0 && document.querySelectorAll('.model-list li').length<${kind==='stt'?20:12}`);
  await c.evaluate(`const search=document.querySelector('[name="modelSearch"]');search.value='no-such-model';search.dispatchEvent(new Event('input',{bubbles:true}));`);await check(`${kind} empty model search`, `document.querySelector('.model-list').innerText.includes('No models match')`);
 }
 await go('/blog');await c.evaluate(`document.querySelector('#privacy-open').click()`);await check('Privacy dialog opens',`document.querySelector('#privacy-dialog').open`);await key('Escape');await check('Privacy dialog closes with Escape',`!document.querySelector('#privacy-dialog').open`);
 assert.deepEqual(errors,[]);results.push({name:'No uncaught browser exceptions',passed:true});
 await save('evidence/after/results.json',JSON.stringify({date:new Date().toISOString(),browser:'Superset Chromium pane via CDP',widths:[320,390,768,1024,1440],results,errors,productionSubmissions:0},null,2));
 console.log(`${results.length} browser assertions passed; evidence committed per file.`);
 await go('/');await c.viewport(1440,900);
}catch(error){console.error(error);await save('evidence/after/failure.json',JSON.stringify({message:error.message,results,errors},null,2));process.exitCode=1;}finally{c.close();}
