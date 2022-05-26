# Foodist

[![Build status](https://ci.appveyor.com/api/projects/status/yyi3d4x52f8ci8j9?svg=true)](https://ci.appveyor.com/project/JG075/foodist) ![GitHub](https://img.shields.io/github/license/JG075/foodist?style=plastic) 

![image](https://foodist.s3.eu-west-1.amazonaws.com/uploads/foodist.gif)

A recipe manager app developed as a personal project following TDD principles. Built in [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/). Also includes a small [Express](https://expressjs.com/) server that provides authentication and a REST API via [json-server](https://github.com/typicode/json-server). Tested with [Jest](https://jestjs.io/) and [Testing Library](https://testing-library.com/).

## Demo

Please note the b/e is hosted on [Heroku](https://heroku.com/) so it may take up to 30 seconds to initially load an API request (such as signing up).

**Visit:**

https://jg075.github.io/foodist/

You can create a new account, or sign in with:

Email: test@example.com

Password: Password123!

## Features

-   Create a recipe (no account required)
-   Create an account to publish your recipe (can then be shared with anyone)
-   Create/Edit/Delete recipes in your account
-   Users that view recipes they don't own have their own local version
-   Auto saving after changes are made
-   Deployment to GitHub Pages and Heroku
-   JSON database is saved to S3

## Installation

[Nodejs](https://nodejs.org/en/) is required. Install foodist with npm:

```bash
git clone https://github.com/JG075/foodist.git
cd foodist
npm install
```

You can then update the `.env` file if you would like images to be uploaded to an s3 bucket, and set API related envs (although these will only apply locally).

To deploy to Heroku you will need the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).

## Run Locally

Start the development server:

```bash
  npm start
```

Start the express server (in another terminal):

```bash
  npm run server
```

## Scripts

### `npm start`

Runs the app in the development mode. Open [http://localhost:3000/foodist](http://localhost:3000/foodist) to view it in your browser.

The page will reload when you make changes. You may also see any lint errors in the console.

### `npm run server`

Starts the server on port 3001. Run this in a separate terminal.

### `npm test`

Launches the test runner in the interactive watch mode. See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run deploy:fe`

Builds the front-end and then deploys the build folder to GitHub Pages.

### `npm run deploy:be`

Pushes the code from `/server` to Heroku.

### `npm run build`

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
