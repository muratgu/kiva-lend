# kivabot

Automate lending in Kiva. 

If amount is available, it lends $25 to first loan applicant found. See kiva.js for the hardcoded search criteria. 

Usage:
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

Example output
```pre
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
