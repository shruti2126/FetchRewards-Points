<!-- @format -->
<!-- This is the README document for this web service. -->

# About

This web service is able to store new transactions from users of Fetch Rewards, deduct points from existing points in their account starting with the oldest transactions and also balance out the remaining points in the account.

# Installation

Steps:-

1. Download VSCode or another IDE that can run JavaScript code.
2. Download and Install NodeJS on your system (<https://nodejs.org/en/download/>).
3. Create a folder and give it a name like "web-service".
4. Navigate into that folder (Either manually or through terminal).
5. Download files from this repository into the folder (If git is installed in this directory, clone this project, follow this link (<https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository>) for instructions on how to use git).
6. Open project directory in VScode or preferred IDE.
7. Use terminal to navigate to project directory.
8. Run 'npm install' to install all required dependencies; Ensure 'node_modules' appear inside directory.
9. Finally, run 'npm start' to run service and wait for console message 'Connected'.

# Usage

1. Download and install Postman either on Desktop or as browser extension. (Other API testing tools can be used, but I will be describing Postman usage here (See #help for Postman related resources)).
2. There are three routes you can send requests to and get responses from -->
   -localhost:5000/api/add for adding points (POST request) - This requires a JSON body as request to receive a successful 200 OK JSON response. The request body is of the form :
   { "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" }
   [NOTE: Only one transaction as this one can be sent at a time. Multiple transactions will throw errors]
   [NOTE: The timestamp field needs to be UNIQUE for each transaction to avoid duplicate entries]
   -localhost:5000/api/spend for spending points (GET request) - This also requires a JSON request of the form {"points": 5000}. A successful response will be a JSON that looks like this : [
   {
   "payer": "DANNON",
   "points": -100
   },
   {
   "payer": "UNILEVER",
   "points": -200
   },
   {
   "payer": "MILLER COORS",
   "points": -4700
   }
   ]
   -localhost:5000/api/balance for balancing points (GET request) - This doesn't require any body for the request. The respose is also in JSON format and should look something like this :
   {
   "DANNON": 1000,
   "UNILEVER": 0,
   "MILLER COORS": 5300
   }

# Help

Refer to comments in project for more clarity about endpoints, routes, schema/model and database connection.
If you need help Building requests using the Postman app interface, learn about it here --> <https://learning.postman.com/docs/sending-requests/requests/>
