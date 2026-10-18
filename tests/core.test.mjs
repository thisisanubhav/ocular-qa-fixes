import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {datasets,products} from '../src/data.js';
import {inquiryURL,inquirySubject,escapeHTML,paginate,rankModels,contactPayload,validateContact} from '../src/core.js';
const data=JSON.parse(await readFile(new URL('../src/benchmarks.json',import.meta.url)));
test('every dataset and product inquiry round-trips through contact context',()=>{
 for(const subject of [...datasets.map(d=>`Sample request: ${d.name}`),...products.map(p=>p.subject||`${p.name} inquiry`),'Hindi & Tamil + speech / 日本語']){
  const url=new URL(inquiryURL(subject),'http://localhost');assert.equal(url.pathname,'/contact');assert.equal(inquirySubject(url.search),subject);
 }
});
test('query context is decoded once, bounded, and escaped as text',()=>{
 assert.equal(inquirySubject('?subject=A%2520B'),'A%20B');assert.equal(inquirySubject('?subject=first&subject=second'),'first');assert.equal(inquirySubject(''),'');
 assert.equal(inquirySubject('?subject='+ 'a'.repeat(1200)).length,1000);
 assert.equal(escapeHTML('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
test('marketplace pagination has no duplicates, resets safely after filtering, and handles empty searches',()=>{
 const pages=[1,2,3].flatMap(page=>paginate(datasets,'All',page).items);assert.equal(new Set(pages.map(d=>d.slug)).size,datasets.length);
 const hindi=paginate(datasets,'Hindi',3);assert.equal(hindi.page,1);assert.equal(hindi.total,1);assert.match(hindi.items[0].name,/Hindi/);
 assert.equal(paginate(datasets,'All',-1).page,1);assert.equal(paginate(datasets,'All','bad').page,1);assert.equal(paginate(datasets,'All',2,'no such dataset').total,0);
});
test('benchmark arrays are the count source and each metric produces valid rankings',()=>{
 assert.equal(data.diarization.length,12);assert.equal(data.stt.length,20);
 for(const models of Object.values(data)){
  assert.equal(new Set(models.map(m=>m.name)).size,models.length);
  for(const metric of Object.keys(models[0].scores)){
   const sorted=rankModels(models,metric);assert.equal(sorted.length,models.length);
   sorted.forEach((model,i)=>{assert.ok(Number.isFinite(model.scores[metric]));if(i){const previous=sorted[i-1].scores[metric];assert.ok(metric==='Speaker Count'?previous>=model.scores[metric]:previous<=model.scores[metric]);}});
  }
 }
 assert.notDeepEqual(rankModels(data.diarization,'DER').map(m=>m.name),rankModels(data.diarization,'JER').map(m=>m.name));
});
test('contact payload preserves edited subject and repeated selections',()=>{
 const form=new FormData();for(const [key,value] of Object.entries({firstName:'QA',lastName:'Tester',email:'qa@example.test',jobTitle:'Researcher',company:'Local QA',companyType:'Startup',subject:'Edited Hindi sample request',message:'Test only'}))form.set(key,value);
 form.append('interests','Browse our Off-the-shelf Datasets');form.append('interests','Research Collaboration');form.append('useCases','Pre-training');
 const payload=contactPayload(form);assert.equal(payload.subject,'Edited Hindi sample request');assert.equal(payload.message,'Test only');assert.equal(payload.interests.length,2);assert.deepEqual(validateContact(payload),{});
 payload.email='invalid';assert.ok(validateContact(payload).email);payload.interests=['Other'];assert.ok(validateContact(payload).otherInterest);
});
