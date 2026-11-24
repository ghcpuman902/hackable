import asyncio, json, pathlib
from playwright.async_api import async_playwright
root = pathlib.Path(__file__).resolve().parent.parent
shots = root/'shots'; shots.mkdir(exist_ok=True)
U = lambda f: 'file://'+str(root/f)
PAGES = [('01-input-chips','01-input-chips.html',0),('02-progress','02-progress.html?speed=50',1500),
 ('03-pattern-fake-recruiter','03-pattern-fake-recruiter.html?scene=2',1800),
 ('03-pattern-session-hijack','03-pattern-session-hijack.html?scene=3',800),
 ('03-pattern-signup-bombing','03-pattern-signup-bombing.html?scene=3',800),
 ('04-report','04-report.html',600),('index','index.html',300)]
async def main():
    errors=[]
    async with async_playwright() as p:
        try: b = await p.chromium.launch()
        except Exception: b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        for vw,vh,tag in [(1280,800,'1280'),(390,844,'390')]:
            ctx = await b.new_context(viewport={'width':vw,'height':vh}, device_scale_factor=2 if vw<500 else 1)
            for name,url,wait in PAGES:
                pg = await ctx.new_page()
                pg.on('pageerror', lambda e,n=name: errors.append(f'{n}: {e}'))
                pg.on('console', lambda m,n=name: m.type=='error' and errors.append(f'{n} console: {m.text}'))
                await pg.goto(U(url)); await pg.wait_for_timeout(wait+300)
                await pg.screenshot(path=str(shots/f'{name}-{tag}.png'))
                ow = await pg.evaluate('document.documentElement.scrollWidth > innerWidth')
                if ow: errors.append(f'{name}@{tag}: horizontal overflow ({await pg.evaluate("document.documentElement.scrollWidth")}px)')
                await pg.close()
            # extra: report full page lit, recruiter scene 0/3 animated
            pg = await ctx.new_page(); await pg.goto(U('04-report.html')); await pg.wait_for_timeout(700)
            await pg.screenshot(path=str(shots/f'04-report-full-{tag}.png'), full_page=True); await pg.close()
            pg = await ctx.new_page(); await pg.goto(U('03-pattern-fake-recruiter.html')); await pg.wait_for_timeout(3600)
            await pg.screenshot(path=str(shots/f'03-pattern-fake-recruiter-live-{tag}.png')); await pg.close()
            pg = await ctx.new_page(); await pg.goto(U('03-pattern-signup-bombing.html')); await pg.wait_for_timeout(9000)
            await pg.screenshot(path=str(shots/f'03-pattern-signup-bombing-live-{tag}.png')); await pg.close()
            await ctx.close()

        # ---------------- chip interaction test ----------------
        ctx = await b.new_context(viewport={'width':1280,'height':800}); pg = await ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(f'chiptest: {e}'))
        await pg.goto(U('01-input-chips.html'))
        await pg.click('#entry')
        await pg.keyboard.type('Jane Doe, jane@hibp-integration-tests.com https://linkedin.com/in/janedoe', delay=25)
        before_enter = await pg.evaluate('window.__mirror.chips')
        await pg.keyboard.press('Enter')
        after = await pg.evaluate('window.__mirror.chips')
        dom = await pg.eval_on_selector_all('#field .chip', 'ns=>ns.map(n=>({kind:n.dataset.kind,label:n.querySelector(".lbl").textContent,hasIcon:!!n.querySelector(".ico svg")}))')
        await pg.screenshot(path=str(shots/'chiptest-1-three-chips.png'))
        # double-click edit the name chip
        await pg.dblclick('#field .chip[data-kind="name"]')
        editing = await pg.evaluate('!!document.querySelector(".chip-edit") && document.activeElement.className')
        val = await pg.input_value('.chip-edit')
        await pg.screenshot(path=str(shots/'chiptest-2-editing.png'))
        await pg.keyboard.press('End'); await pg.keyboard.type(' Smith'); await pg.keyboard.press('Enter')
        edited = await pg.evaluate('window.__mirror.chips')
        # edit a chip into two tokens + check order is kept
        await pg.dblclick('#field .chip[data-kind="linkedin"]')
        await pg.fill('.chip-edit', 'github.com/janedoe, @janedoe_dev'); await pg.keyboard.press('Enter')
        split = await pg.evaluate('window.__mirror.chips')
        # backspace twice removes last chip
        await pg.click('#entry'); await pg.keyboard.press('Backspace'); await pg.keyboard.press('Backspace')
        afterbs = await pg.evaluate('window.__mirror.chips')
        # consent gate
        await pg.click('text=Someone else')
        dis1 = await pg.is_disabled('#submit')
        await pg.check('#agreed'); dis2 = await pg.is_disabled('#submit')
        await pg.screenshot(path=str(shots/'chiptest-3-consent.png'))
        await pg.click('#submit'); await pg.wait_for_timeout(1200)
        landed = pg.url.split('/')[-1][:20]
        await pg.screenshot(path=str(shots/'chiptest-4-handoff-to-02.png'))
        # 390 typing check
        m = await b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2); mp = await m.new_page()
        await mp.goto(U('01-input-chips.html')); await mp.click('#entry')
        await mp.keyboard.type('Jane Doe, jane@hibp-integration-tests.com https://linkedin.com/in/janedoe', delay=10); await mp.keyboard.press('Enter')
        await mp.screenshot(path=str(shots/'chiptest-5-mobile-390.png'))
        mob = await mp.evaluate('window.__mirror.chips')
        await b.close()
    print(json.dumps(dict(before_enter=before_enter, after_enter=after, dom=dom, editing_focus=editing, edit_value=val, after_edit=edited,
        after_split_edit=split, after_double_backspace=afterbs, submit_disabled_before_consent=dis1, submit_disabled_after_consent=dis2,
        landed=landed, mobile=mob, errors=errors), indent=1))
asyncio.run(main())
