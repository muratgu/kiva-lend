const { chromium } = require('playwright');

(async () => {
  if (process.env.EMAIL && process.env.PASSWORD) {
    //ok
  } else {
    console.log('EMAIL and PASSWORD required')
    process.exit(-1)
  }

  console.log('Launch browser')
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Go to https://www.kiva.org/')
  await page.goto('https://www.kiva.org/');
  
  console.log('Sign in')
  await Promise.all([
    page.waitForNavigation(),
    page.click('text=Sign in')
  ]);
  await page.click('text=sign in to Kiva');
  await page.waitForTimeout(1000);
  await page.click('input[name="email"]');
  await page.fill('input[name="email"]', process.env.EMAIL);
  await page.press('input[name="email"]', 'Tab');
  await page.fill('input[name="password"]', process.env.PASSWORD);
  await Promise.all([
    page.waitForNavigation(),
    page.press('input[name="password"]', 'Enter')
  ]);

  const amount = await (await page.textContent('a.header-button.my-kiva .amount')).replace('$','')
  console.log('Amount left = ' + amount)

  if (Number(amount) > 25) {
    console.log('Search')
    await page.goto('https://www.kiva.org/lend?sector=1,12,8&sortBy=amountLeft')
    await page.waitForTimeout(3000);
  
    console.log('Lend $25 to first one')
    await page.click('text=Lend $25');

    console.log('Checkout now')
    // Click text=Checkout now
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://www.kiva.org/checkout' }*/),
      page.click('text=Checkout now')
    ]);

    console.log('Remove the donation to Kiva')
    await page.click('text=$3.75 Edit Donation');
    // Click text=No donation to Kiva
    await page.click('text=No donation to Kiva');

    console.log('Complete order')
    await page.click('button#kiva-credit-payment-button');
    await page.waitForTimeout(3000);

  } else {
    console.log('Not enough funds to lend')
  }

  console.log('Sign out')
  await page.goto('https://www.kiva.org/ui-logout')

  await context.close();
  await browser.close();
})();