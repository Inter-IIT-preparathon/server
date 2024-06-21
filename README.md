# Server
Back-end of the web app

# Procedure to make a PR:
Before making PR, take a pull from main branch

# Setting up the project:

## Requirements
Make sure you have installed all of the following prerequisites on your development machine:

* Git - Download & Install Git. OSX and Linux machines typically have this already installed.
* VS Code - Download & Install VS Code, one of the most popular code - editor developed by Microsoft.
* Nodejs - Runtime environment for JS
* PostgreSql should be in your local system or deployed on any platform.

## Procedure to setup the project:
1. Install dependencies    
   ```
   npm i
   ```
3. Create a .env file and fill up the template given in .env.example file according to your configuration (eg., your PostgreSql database settings)
4. To run development server:
   ```
   npm run dev
   ```
6. After completing your work, commit your changes and push them.
7. Take pull from main branch and resolve conflicts if any (Important)
8. Make a pull request to the main branch and wait for approval to merge
9. Recommended Format for Title of Commits:      
   [ADDED]... or [UPDATED]... or [DELETED]...

## Recommended code practices:
1. In defining a controller of api, pass next also with req, res. For eg.,      
   ```
   const login = async (req, res, next) => {...}
   ```
2. Always put api controllers in try catch blocks. Pass the errors to next(). Eg:
   * Passing catch errors:
     ```
     try {
     ...
     } catch (error) {
        next(error);
     }
     ```
   * Passing Custom errors:
     ```
     const {ErrorHandler} = require("../../middleware/error.js");
     ...
     return next(new ErrorHandler(message, statusCode);
     ```
3. To send a successResponse:
   ```
   const sendTrue = require("../utils/sendTrue.js");
   ...
   return sendTrue(res, statusCode, message);
   ```
5. Here Errors are passed to next, it passes to inbuilt Error Class of js, it is then extended to custom ErrorHandler Class in middlewares/error.js. 
6. async await is more preferrable than promises.
   




   
