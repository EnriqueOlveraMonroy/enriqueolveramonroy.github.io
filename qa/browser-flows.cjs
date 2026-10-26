async (page) => {
 const r={checks:[],viewports:[],accessibility:[],errors:[],networkErrors:[],consoleErrors:[],failedRequests:[],screenshots:[],imageRects:[]};
 const check=(name,passed,detail)=>r.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});
 const base='http://127.0.0.1:8000/';
 page.on('pageerror',e=>r.errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')r.consoleErrors.push(m.text());});
 page.on('requestfailed',req=>{if(req.url().startsWith(base)&&req.failure()?.errorText!=='net::ERR_ABORTED')r.failedRequests.push({url:req.url(),error:req.failure()?.errorText});});
 page.on('response',res=>{if(res.status()>=400&&res.url().startsWith(base))r.networkErrors.push({url:res.url(),status:res.status()});});
 await page.goto(base);
 await page.evaluate(()=>localStorage.clear());await page.reload();
 check('English by default',await page.locator('html').getAttribute('lang')==='en');
 for(const lang of ['en','es']){
  await page.locator(`[data-language="${lang}"]`).click();
  check(`Language ${lang}`,await page.locator('html').getAttribute('lang')===lang);
  for(const [filter,count] of Object.entries({all:11,bi:2,analysis:2,ml:4,excel:1,web:2})){
   await page.locator(`[data-filter="${filter}"]`).click();
   const visible=await page.locator('[data-category]:visible').count();
   check(`Filter ${filter} (${lang})`,visible===count,{expected:count,actual:visible});
  }
  await page.locator('[data-filter="all"]').click();
  for(const key of ['restaurant','retail','excelEn','excelEs','fraud','default','score','debt','netflix','regression','housing','music','certificate']){
   const trigger=page.locator(`[data-image="${key}"]`);
   await trigger.click();
   await page.waitForFunction(()=>document.querySelector('#expanded-image').complete&&document.querySelector('#expanded-image').naturalWidth>0);
   check(`Preview ${key} (${lang})`,await page.locator('dialog').evaluate(d=>d.open));
   await page.locator('#image-zoom').click();
   check(`Zoom ${key} (${lang})`,await page.locator('.image-stage').evaluate(el=>el.classList.contains('zoomed')));
   await page.locator('#image-zoom').click();
   await page.keyboard.press('Escape');
   check(`Focus return ${key} (${lang})`,await trigger.evaluate(el=>el===document.activeElement));
  }
 }
 await page.reload();check('Language persists on reload',await page.locator('html').getAttribute('lang')==='es');
 await page.locator('[data-filter="ml"]').click();await page.reload();
 check('Filter survives reload',await page.locator('[data-category]:visible').count()===4 && new URL(page.url()).searchParams.get('category')==='ml');
 await page.locator('[data-filter="excel"]').click();await page.goBack();
 check('Browser Back restores filter',await page.locator('[data-category]:visible').count()===4);
 await page.goto(base+'?category=%3Cscript%3Ebad%3C%2Fscript%3E');
 check('Unknown category falls back safely',await page.locator('[data-category]:visible').count()===11);
 await page.goto(base);
 for(const width of [1440,1280,1024,768,700,520,390,320]){
  await page.setViewportSize({width,height:900});
  for(const lang of ['en','es']){
   await page.locator(`[data-language="${lang}"]`).click();
   const state=await page.evaluate(({width,lang})=>({width,lang,overflow:document.documentElement.scrollWidth>innerWidth,docWidth:document.documentElement.scrollWidth}),{width,lang});
   r.viewports.push(state);check(`No horizontal overflow ${width}/${lang}`,!state.overflow);
  }
 }
 await page.setViewportSize({width:390,height:900});
 await page.locator('.menu-toggle').click();check('Mobile menu opens',await page.locator('#mobile-nav').isVisible());
 await page.keyboard.press('Escape');check('Escape closes mobile menu and restores focus',await page.locator('#mobile-nav').isHidden()&&await page.locator('.menu-toggle').evaluate(el=>el===document.activeElement));
 await page.locator('.menu-toggle').click();await page.locator('#mobile-nav a[href="#work"]').click();
 check('Mobile navigation transfers focus to content',await page.locator('#mobile-nav').isHidden()&&await page.locator('#work').evaluate(el=>el===document.activeElement));
 await page.locator('.menu-toggle').click();await page.setViewportSize({width:1440,height:900});
 check('Mobile menu closes at desktop breakpoint',await page.locator('#mobile-nav').isHidden());
 await page.setViewportSize({width:390,height:900});check('Resizing back keeps menu closed',await page.locator('#mobile-nav').isHidden());
 await page.setViewportSize({width:1440,height:900});await page.goto(base);
 await page.keyboard.press('Tab');check('Skip link is first keyboard target',await page.locator('.skip').evaluate(el=>el===document.activeElement));
 await page.keyboard.press('Enter');check('Skip link moves focus to main',await page.locator('main').evaluate(el=>el===document.activeElement));
 const summary=page.locator('.timeline details').nth(1);
 await summary.locator('summary').focus();await page.keyboard.press('Enter');check('Experience expands using keyboard',await summary.evaluate(el=>el.open));
 await page.keyboard.press('Enter');check('Experience collapses using keyboard',!await summary.evaluate(el=>el.open));
 const downloadPromise=page.waitForEvent('download');await page.locator('.sidebar-cv').click();const download=await downloadPromise;
 check('CV download',await download.failure()===null,download.suggestedFilename());
 const pdf=await page.request.get(base+'assets/enrique-olvera-cv.pdf');check('CV is a real PDF',pdf.status()===200&&(await pdf.body()).subarray(0,5).toString()==='%PDF-');
 await page.emulateMedia({reducedMotion:'reduce'});check('Reduced motion',await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior==='auto'&&getComputedStyle(document.querySelector('.dashboard-card')).transitionDuration==='0s'));
 await page.emulateMedia({reducedMotion:'no-preference'});
 // Deliberate network failure is isolated from normal-flow console/network results.
 const failurePage=await page.context().newPage();
 await failurePage.route('**/assets/restaurant-dashboard.png',route=>route.abort());await failurePage.goto(base);await failurePage.locator('[data-image="restaurant"]').click();
 await failurePage.locator('#image-retry').waitFor({state:'visible'});
 check('Image failure has honest accessible message',await failurePage.locator('#image-caption').textContent()!=='');
 check('Zoom disabled while image unavailable',await failurePage.locator('#image-zoom').isDisabled());
 await failurePage.unroute('**/assets/restaurant-dashboard.png');await failurePage.locator('#image-retry').click();
 await failurePage.waitForFunction(()=>document.querySelector('#expanded-image').naturalWidth>0);
 check('Image retry recovers',await failurePage.locator('#image-retry').isHidden()&&await failurePage.locator('#image-zoom').isEnabled());await failurePage.close();
 const blocked=await page.context().newPage();await blocked.addInitScript(()=>{Storage.prototype.getItem=function(){throw new DOMException('Blocked','SecurityError')};Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError')};});await blocked.goto(base);await blocked.locator('[data-language="es"]').click();check('Blocked storage does not break language',await blocked.locator('html').getAttribute('lang')==='es');await blocked.close();
 const nojsContext=await page.context().browser().newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});const nojs=await nojsContext.newPage();await nojs.goto(base);
 check('No-JS projects retained',await nojs.locator('[data-category]').count()===11);
 check('No-JS mobile navigation available',await nojs.locator('#mobile-nav').isVisible());
 check('No-JS unavailable controls hidden',await nojs.locator('.filters').isHidden()&&await nojs.locator('.languages').isHidden());
 const imageLink=nojs.locator('[data-image="restaurant"]');await imageLink.click();check('No-JS preview opens real image',new URL(nojs.url()).pathname==='/assets/restaurant-dashboard.png');await nojsContext.close();
 const security=await page.context().newPage();await security.goto(base);
 const policy=await security.evaluate(async()=>{const script=document.createElement('script');script.textContent='window.__unexpectedScript=true';document.head.append(script);let blockedFetch=false;try{await fetch('https://example.invalid/blocked-by-policy')}catch{blockedFetch=true}return {inlineBlocked:window.__unexpectedScript!==true,connectBlocked:blockedFetch,policy:document.querySelector('meta[http-equiv="Content-Security-Policy"]').content};});
 check('CSP blocks injected inline script',policy.inlineBlocked);check('CSP blocks external connections',policy.connectBlocked);await security.close();
 check('Normal flows produce no console errors',r.consoleErrors.length===0,r.consoleErrors);
 check('Normal resources do not fail',r.failedRequests.length===0,r.failedRequests);
 check('Normal flows produce no uncaught JS errors',r.errors.length===0,r.errors);
 check('Normal flows produce no HTTP errors',r.networkErrors.length===0,r.networkErrors);
 await page.goto(base);await page.setViewportSize({width:1440,height:900});
 const failed=r.checks.filter(c=>!c.passed);
 if(failed.length)throw new Error(JSON.stringify(failed));
 return {passed:r.checks.length,failed:0,viewports:r.viewports};
}
