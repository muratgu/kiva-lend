const { chromium } = require('playwright');
const dotenv = require('dotenv');
const figlet = require('figlet')
const clear = require('clear')
const clui = require('clui')
const chalk = require('chalk')
const log = console.log;

(async () => {

  clear()
  log(chalk.green(figlet.textSync('KivaBot', { horizontalLayout: 'full' }) ));

  dotenv.config()

  const for_real = process.argv.find(x => x == '--for-real')
  log(chalk.blue(for_real?'For real':'Dry run (--for-real to turn off)'));

  const headfull = process.argv.find(x => x == '--headfull')
  log(chalk.blue(headfull?'Headfull':'Headless (--headfull to turn off)'));

  if (process.env.EMAIL && process.env.PASSWORD) {
    //ok
  } else {
    log(chalk.red('EMAIL and PASSWORD required'));
    process.exit(-1)
  }

  log(chalk.green('Launching browser'))
  const browser = await chromium.launch({
    headless: !headfull
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  log(chalk.green('Navigating to https://www.kiva.org/'))
  await page.goto('https://www.kiva.org/');
  
  log(chalk.green('Signing in'))
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
  await page.press('input[name="password"]', 'Enter');
  await page.waitForTimeout(500);

  const amount = await (await page.textContent('a.header-button.my-kiva .amount')).replace('$','')
  log(chalk.green('Amount left = ' + amount));

  if (Number(amount) >= 25) {
    log(chalk.green('Searching'))
    const filter = 'country=kg,tj&sector=1&sortBy=amountLeft'
    await page.goto('https://www.kiva.org/lend/?' + filter)
    await page.waitForTimeout(1500);
  
    const borrower_name = await (await page.textContent('.loan-card-2-borrower-name')).trim()
    const borrower_country = await (await page.textContent('.loan-card-2-country')).trim()
    const borrower_use = await (await page.textContent('.loan-card-2-use')).trim()

    log(chalk.green(`${borrower_name} from ${borrower_country}. ${borrower_use}`));

    log(chalk.green('Lending $25'))
    await page.click('text=Lend $25')

    log(chalk.green('Checking out'))
    // Click text=Checkout now
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://www.kiva.org/checkout' }*/),
      page.click('text=Checkout now')
    ]);

    log(chalk.green('Removing the donation to Kiva'))
    await page.click('text=$3.75 Edit Donation');
    // Click text=No donation to Kiva
    await page.click('text=No donation to Kiva');
    await page.waitForTimeout(1500);

    const total_value = await (await page.textContent('.total-value')).replace('(','').replace(')','')
    log(chalk.green(`Total value ${total_value}`));
    if (total_value != '$25.00') {    
      log(chalk.red('Total value expected to be $25.00'));
      process.exit(-1)
    }

    log(chalk.green('Completing the order'))
    if (for_real) {
      await page.click('button#kiva-credit-payment-button')
      await page.waitForTimeout(1500)
    } else {
      log(chalk.red('(DRYRUN) click button#kiva-credit-payment-button'));
    }
  } else {
    log(chalk.red('Not enough funds to lend'));
  }

  log(chalk.green('Signing out'))
  await page.goto('https://www.kiva.org/logout')
  
  await context.close()
  await browser.close()
})();