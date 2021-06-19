# kivabot

Automate lending in Kiva. 

If available, it lends $25 to first loan applicant found.

# Usage
```console
set KIVA_EMAIL=<your kiva email>
set KIVA_PASSWORD=<your kiva password>
set KIVA_CRITERIA=<your search criteria>
```

Or, create a `.env` file to override
```console
KIVA_EMAIL=<your kiva email>
KIVA_PASSWORD=<your kiva password>
KIVA_CRITERIA=<your search criteria>
```

and run

```console
node kiva.js
```
The above will do a dry-run. It will tell you if it found a loan to lend but will not lend unless you specify `--for-real` when you invoke the script.

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
Lending amount is [25]
Search criteria is [gender=female&sector=1&sortBy=amountLeft]
Launching browser
Navigating to https://www.kiva.org/
Signing in
Amount left = 11
Info: $11 not enough to lend
```

## How do I pick where to lend?

Kivabot will pick the first loan among the ones found on the lending search page.

## How do I specify the search criteria?

The search criteria is specified in environment variable KIVA_CRITERIA. To replace it, do the following:
1) Navigate to page https://www.kiva.org/lend? (pick the `classic` loan explorer)
2) Pick any search criteria. The browser url will change accordingly. Copy the query parameters on the url.
3) Set the KIVA_CRITERIA to the copied value.

      For example, if you searched for loans for women in agriculture sorted by amount left,
      the setting would be:
      > KIVA_CRITERIA="gender=female&sector=1&sortBy=amountLeft"
