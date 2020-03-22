# zombie-roleplaying-server
A Koa server to host my zombie role-playing game!

## To Run
1. Clone this repository
1. Run `npm install` or `yarn`
1. Have a local instance of MongoDB installed and running
1. Create a copy of `.env.example` named `.env` and replace the variables with real values
   1. A lot of them are probably fine defaulted as they are!
1. Run `yarn start`
1. Enjoy!

## To Test
1. Run `yarn` if you haven't
1. Have a local instance of MongoDB installed and running
1. Create a copy of `.env.example` named `.env` and replace the variables with real values
   1. The most important one for these tests is `TEST_MONGO_DB` - the default is fine unless you want to rename it!
1. Run `yarn test` and behold

## Dependencies
1. MongoDB
