const { chromium } = require('playwright');

(async () => {

  const for_real = process.argv.find(x => x == '--for-real')
  console.log(for_real?'For real':'Dry run (--for-real to turn off)')

  const headfull = process.argv.find(x => x == '--headfull')
  console.log(headfull?'Headfull':'Headless (--headfull to turn off)')

  if (process.env.EMAIL && process.env.PASSWORD) {
    //ok
  } else {
    console.log('EMAIL and PASSWORD required')
    process.exit(-1)
  }

  console.log('Launch browser')
  const browser = await chromium.launch({
    headless: !headfull
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

  if (Number(amount) >= 25) {
    console.log('Search')
    const filter = 'country=kg,tj&sector=1&sortBy=amountLeft'
    await page.goto('https://www.kiva.org/lend/?' + filter)
    await page.waitForTimeout(1500);
  
    const borrower_name = await (await page.textContent('.loan-card-2-borrower-name')).trim()
    const borrower_country = await (await page.textContent('.loan-card-2-country')).trim()
    const borrower_use = await (await page.textContent('.loan-card-2-use')).trim()

    console.log(`${borrower_name} from ${borrower_country}. ${borrower_use}`)

    console.log('Lend $25')
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
    await page.waitForTimeout(1500);

    const total_value = await (await page.textContent('.total-value')).replace('(','').replace(')','')
    console.log(`Total value ${total_value}`)
    if (total_value != '$25.00') {    
      console.log('Total value expected to be $25.00')
      process.exit(-1)
    }

    console.log('Complete order')
    if (for_real) {
      await page.click('button#kiva-credit-payment-button');
      await page.waitForTimeout(1500);
    } else {
      console.log('(DRYRUN) click button#kiva-credit-payment-button');
    }
  } else {
    console.log('Not enough funds to lend')
  }

  console.log('Sign out')
  await page.goto('https://www.kiva.org/logout')

  await context.close()
  await browser.close()
})();