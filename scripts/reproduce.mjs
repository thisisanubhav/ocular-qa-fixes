import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:768,height:1024},deviceScaleFactor:1});
const results={source:'https://www.useocular.com',capturedAt:new Date().toISOString()};
const save=async(file,content)=>{
 await writeFile(file,content);execFileSync('git',['add','--',file]);
 try{execFileSync('git',['diff','--cached','--quiet','--',file]);}catch{execFileSync('git',['commit','-m',`Capture ${file}`],{stdio:'ignore'});}
};
const shot=async name=>save(`evidence/before/${name}.png`,await page.screenshot());
try{
 await page.goto('https://www.useocular.com/careers');await page.locator('header').waitFor();
 results.navigation=await page.locator('header a,header button').evaluateAll(elements=>elements.map(el=>({name:el.getAttribute('aria-label')||el.textContent,x:el.getBoundingClientRect().x,right:el.getBoundingClientRect().right,width:el.getBoundingClientRect().width})));
 await shot('tablet-navigation');
 await page.setViewportSize({width:1440,height:900});
 await page.goto('https://www.useocular.com/contact?subject=Sample%20request%3A%20Hindi%20Full-Duplex%20Conversational%20Dataset');await page.locator('textarea').waitFor();
 results.context=await page.evaluate(()=>({url:location.href,visibleSubject:document.body.innerText.includes('Hindi Full-Duplex'),fields:Array.from(document.querySelectorAll('input,textarea')).map(el=>({name:el.name,value:el.value}))}));
 results.logos=await page.locator('header a[href="/"],footer a[href="/"]').evaluateAll(elements=>elements.map(el=>({text:el.textContent,label:el.getAttribute('aria-label'),title:el.getAttribute('title')})));
 await page.locator('textarea').scrollIntoViewIfNeeded();await shot('contact-context');
 await page.goto('https://www.useocular.com/');
 await page.waitForFunction(()=>document.body.innerText.includes('11 models'));
 results.count=await page.evaluate(()=>({eleven:document.body.innerText.includes('11 models'),twelve:document.body.innerText.includes('12')}));
 const slide=page.locator('button[aria-label*="slide 3" i]');
 if(await slide.count())await slide.first().click();
 else {
  const labels=await page.locator('button').evaluateAll(elements=>elements.map(el=>el.getAttribute('aria-label')).filter(Boolean));
  console.log('Carousel labels:',labels);
 }
 await page.waitForTimeout(500);await shot('homepage-count');
 await save('evidence/before/reproduction.json',JSON.stringify(results,null,2));
 console.log('Production defects reproduced without submissions.');
}finally{await browser.close();}
