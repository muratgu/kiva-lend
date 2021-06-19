# kivabot

Automate lending in Kiva. 

If amount is available, it lends $25 to first loan applicant found. See kiva.js for the hardcoded search criteria. 

# Usage
```console
set EMAIL=<your kiva email>
set PASSWORD=<your kiva password>
```

Or, create a `.env` file to override
```console
EMAIL=<your kiva email>
PASSWORD=<your kiva password>
```

and run

```console
node kiva.js
```

# Example
```pre
> node kiva.js
 _  __  _                   ____            _
 | |/ / (_) __   __   __ _  | __ )    ___   | |_
 | ' /  | | \ \ / /  / _` | |  _ \   / _ \  | __|
 | . \  | |  \ V /  | (_| | | |_) | | (_) | | |_
 |_|\_\ |_|   \_/    \__,_| |____/   \___/   \__|

Dry run (--for-real to turn off)
Headless (--headfull to turn off)
--quiet to turn off verbosity
Launching browser
Navigating to https://www.kiva.org/
Signing in
Amount left = 11
Info: $11 not enough to lend
Closing
```

## How do I pick where to lend?

Kivabot will pick the first loan among the ones found on the lending search page.

## How do I specify the search criteria?

The search criteria is hardcoded. To replace it, do the following:
1) Navigate to page https://www.kiva.org/lend? (pick the `classic` loan explorer)
2) Pick any search criteria. The browser url will change accordingly. Copy the query parameters on the url.
3) Open the script named `kiva.js` for editing
   1) Find the `lendingCriteria` constant declaration
   2) Replace the value on the right side with the the query parameters copied earlier.
      For example, if you searched for loans for women in agriculture sorted by amount left,
      the lendingCriteria line would read:
      > const lendingCriteria = 'gender=female&sector=1&sortBy=amountLeft'

4) Save `kiva.js`
