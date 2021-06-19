const { chromium } = require('playwright');
const dotenv = require('dotenv');
const figlet = require('figlet')
const clear = require('clear')
const chalk = require('chalk')
const log = console.log;

(async () => {

  try {

    dotenv.config()

    const quiet = process.argv.find(x => x == '--quiet' || x == '-q')
    if (!quiet) clear()
    if (!quiet) log(chalk.green(figlet.textSync('KivaBot', { horizontalLayout: 'full' }) ));
    
    const for_real = process.argv.find(x => x == '--for-real')
    if (!quiet) log(chalk.blue(for_real?'For real':'Dry run (--for-real to turn off)'));

    const headfull = process.argv.find(x => x == '--headfull')
    if (!quiet) log(chalk.blue(headfull?'Headfull':'Headless (--headfull to turn off)'));
    
    if (!quiet) log(chalk.blue('--quiet to turn off verbosity'));

    if (process.env.KIVA_EMAIL) {
      //ok
    } else {
      log(chalk.red('Error: KIVA_EMAIL is required'));
      process.exit(-1)
    }

    if (process.env.KIVA_PASSWORD) {
      //ok
    } else {
      log(chalk.red('Error: KIVA_PASSWORD is required'));
      process.exit(-1)
    }

    if (process.env.KIVA_CRITERIA) {
      //ok
    } else {
      log(chalk.red('Error: KIVA_CRITERIA is required'));
      process.exit(-1)
    }

    const kivaEmail = process.env.KIVA_EMAIL
    const kivaPassword = process.env.KIVA_PASSWORD
    const lendingAmount = 25 // set the amount to lend here
    const lendingCriteria = process.env.KIVA_CRITERIA

    if (!quiet) log(chalk.green(`Lending amount is [${lendingAmount}]`))
    if (!quiet) log(chalk.green(`Search criteria is [${lendingCriteria}]`))
    if (!quiet) log(chalk.green('Launching browser'))
    const browser = await chromium.launch({
      headless: !headfull
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    if (!quiet) log(chalk.green('Navigating to https://www.kiva.org/'))
    await page.goto('https://www.kiva.org/');
    
    if (!quiet) log(chalk.green('Signing in'))
    await Promise.all([
      page.waitForNavigation(),
      page.click('text=Sign in')
    ]);
    await page.click('text=sign in to Kiva');
    await page.waitForTimeout(1000);
    await page.click('input[name="email"]');
    await page.fill('input[name="email"]', kivaEmail);
    await page.press('input[name="email"]', 'Tab');
    await page.fill('input[name="password"]', kivaPassword);
    await page.press('input[name="password"]', 'Enter');
    await page.waitForTimeout(500);

    const amount = await (await page.textContent('a.header-button.my-kiva .amount')).replace('$','')
    if (!quiet) log(chalk.green('Amount left = ' + amount));

    if (Number(amount) >= lendingAmount) {
      if (!quiet) log(chalk.green(`Searching for "${lendingCriteria}"`))

      await page.goto(`https://www.kiva.org/lend/?${lendingCriteria}`)
      await page.waitForTimeout(1500);
    
      const borrower_name = await (await page.textContent('.loan-card-2-borrower-name')).trim()
      const borrower_country = await (await page.textContent('.loan-card-2-country')).trim()
      const borrower_use = await (await page.textContent('.loan-card-2-use')).trim()

      if (!quiet) log(chalk.green(`${borrower_name} from ${borrower_country}. ${borrower_use}`));

      if (!quiet) log(chalk.green(`Lending ${lendingAmount}`))
      await page.click(`text=Lend ${lendingAmount}`)

      if (!quiet) log(chalk.green('Checking out'))
      // Click text=Checkout now
      await Promise.all([
        page.waitForNavigation(/*{ url: 'https://www.kiva.org/checkout' }*/),
        page.click('text=Checkout now')
      ]);

      if (!quiet) log(chalk.green('Removing the donation to Kiva'))
      await page.click('text=$3.75 Edit Donation');
      // Click text=No donation to Kiva
      await page.click('text=No donation to Kiva');
      await page.waitForTimeout(1500);

      const total_value = await (await page.textContent('.total-value')).replace('(','').replace(')','')
      if (!quiet) log(chalk.green(`Total value ${total_value}`));
      if (total_value != `${lendingAmount}.00`) {    
        log(chalk.red(`Error: Total value was expected to be $25.00 but found: ${total_value}`));
        process.exit(4)
      }

      if (!quiet) log(chalk.green('Completing the order'))
      if (for_real) {
        await page.click('button#kiva-credit-payment-button')
        await page.waitForTimeout(1500)
        log(chalk.green(`Info: Lended ${total_value} to ${borrower_name} from ${borrower_country}`));
        process.exit(1);
      } else {
        if (!quiet) log(chalk.red('(DRYRUN) click button#kiva-credit-payment-button'));
        process.exit(2);
      }
    } else {
      log(chalk.red(`Info: $${amount} not enough to lend`));
      process.exit(3);
    }

    if (!quiet) log(chalk.green('Closing'))
    
    await context.close()
    await browser.close()

  } catch(e) {

    log(chalk.red(e))

  }
})();