import asyncio, json, pathlib, urllib.parse
from playwright.async_api import async_playwright
root = pathlib.Path(__file__).resolve().parent.parent; shots = root/'shots'
U = lambda q='': 'file://'+str(root/'05-search-flow.html')+q
TEXT = 'Jane Doe, jane@hibp-integration-tests.com https://linkedin.com/in/janedoe'
async def main():
    res={}; errors=[]
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for vw,vh,tag in [(1280,800,'1280'),(390,844,'390')]:
            ctx = await b.new_context(viewport={'width':vw,'height':vh}, device_scale_factor=2 if vw<500 else 1)
            pg = await ctx.new_page()
            pg.on('pageerror', lambda e: errors.append(f'{tag}: {e}'))
            pg.on('console', lambda m: m.type=='error' and errors.append(f'{tag} console: {m.text}'))
            await pg.goto(U()); await pg.wait_for_timeout(300)
            await pg.screenshot(path=str(shots/f'05-landing-{tag}.png'))
            await pg.click('#entry'); await pg.keyboard.type(TEXT, delay=15); await pg.keyboard.press('Enter')
            chips = await pg.evaluate('window.__mirror.chips')
            icons = await pg.eval_on_selector_all('#field .chip', 'ns=>ns.map(n=>n.dataset.kind+":"+!!n.querySelector(".ico svg"))')
            await pg.dblclick('#field .chip[data-kind="name"]'); ed = await pg.input_value('.chip-edit')
            await pg.keyboard.press('End'); await pg.keyboard.type(' Smith'); await pg.keyboard.press('Enter')
            edited = [c['label'] for c in await pg.evaluate('window.__mirror.chips')]
            await pg.screenshot(path=str(shots/f'05-chips-{tag}.png'))
            # consent gate
            await pg.click('text=Someone else'); g1 = await pg.is_disabled('#submit')
            top_before = await pg.evaluate('document.querySelector(".field").getBoundingClientRect().top')
            await pg.check('#agreed'); g2 = await pg.is_disabled('#submit')
            await pg.click('text=Me')
            # submit via Enter on empty input
            await pg.click('#entry'); await pg.keyboard.press('Enter')
            await pg.wait_for_timeout(110)
            await pg.screenshot(path=str(shots/f'05-transition-{tag}.png'))
            await pg.wait_for_timeout(7000)
            url_q = 'q=' in pg.url
            await pg.screenshot(path=str(shots/f'05-results-{tag}.png'))
            n_cards = await pg.evaluate('document.querySelectorAll("#report .sec").length')
            await pg.evaluate('document.querySelectorAll("#report .sec")[3].scrollIntoView({block:"start"})'); await pg.evaluate('scrollBy(0,-16)'); await pg.wait_for_timeout(2500)
            await pg.screenshot(path=str(shots/f'05-results-scrolled-{tag}.png'))
            await pg.screenshot(path=str(shots/f'05-results-full-{tag}.png'), full_page=True)
            await pg.click('#morebtn'); n_more = await pg.evaluate('document.querySelectorAll("#report .sec").length')
            overflow = await pg.evaluate('document.documentElement.scrollWidth > innerWidth')
            # reload restores from URL; Back returns to landing
            await pg.reload(); await pg.wait_for_timeout(6500)
            restored = await pg.evaluate('[window.__mirror.chips.length, document.body.classList.contains("results"), document.querySelectorAll("#report .sec").length]')
            await pg.go_back(); await pg.wait_for_timeout(500)
            back = await pg.evaluate('document.body.classList.contains("results")')
            fs = await pg.evaluate('getComputedStyle(document.querySelector("#entry")).fontSize')
            res[tag]=dict(chips=chips, icons=icons, edit_value=ed, after_edit=edited, disabled_without_consent=g1, disabled_after_consent=g2,
                          url_has_q=url_q, cards=n_cards, cards_after_more=n_more, h_overflow=overflow, reload_restored=restored, back_to_landing=not back, input_font=fs)
            await ctx.close()
        await b.close()
    res['errors']=errors; print(json.dumps(res, indent=1))
asyncio.run(main())
