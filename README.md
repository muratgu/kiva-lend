# kivabot

Automate lending in Kiva. 

If amount is available, it lends $25 to first loan applicant found. See kiva.js for the hardcoded search criteria. 

Usage:

`> set EMAIL=<your kiva email>`

`> set PASSWORD=<your kiva password>`

or, create a `.env` file to override

`EMAIL=<your kiva email>`

`PASSWORD=<your kiva password>`

and run

`> node kiva.js`
