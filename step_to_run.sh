
#How to run the docker-compose

first check if creds.sh exits in root directory if not then create it as per the database creds
------> source ./creds.sh
-------> docker-compose build
-------> docker-compose up -d


---------------------------------------------------------------------------
If anything is needed to be changed then
-------------------> docker-compose down -v


###############################################################################################################################

Then only you can run the application for client and server

Server:
 -----------> do not forgot to npm i
------> use nodemon index.js


Client:

 ------------> npm i
 -------------> npm start