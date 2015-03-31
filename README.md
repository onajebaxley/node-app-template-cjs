[![Build Status](https://travis-ci.org/vamship/node-app-template-cjs.svg?branch=master)](https://travis-ci.org/vamship/node-app-template-cjs)

## App Template (Common JS)

This is a sample application template for web applications that run on the [Node JS](http://nodejs.org) platform. This template uses the following technologies:

###Application Tools
* [Node JS](http://nodejs.org/): Core platform; engine on which all server side code executes
* [Express JS](http://expressjs.com/): Web server (dynamic pages, web services)
    * [Jade Templating](http://jade-lang.com/): Templating language used to generate dynamic pages 
* [Angular JS](https://angularjs.org/): Client side application development framework
* [Bootstrap](http://getbootstrap.com/): Core styles for responsive elements
* [Winston](https://github.com/flatiron/winston): Logging framework.

###Development Tools
* [npm](https://www.npmjs.org/): Server side package manager. Manages server side dependencies (node modules).
* [bower](http://bower.io): Client side dependency manager. Helps download client side libraries for the project
* [browserify](http://browserify.org/): Common JS bundling tool for client side scripts - allows client side javascript to be modularized like node.js modules
* [grunt](http://gruntjs.com/): Javascript task automater. Used to automate common development tasks - builds, tests, etc.

###Project Structure
The project has the following structure.

```
<ROOT>
 |--- server            [Server side files]
 |   |--- views         [Views (jade templates)]
 |   |--- routes        [Express.js route definitions]
 |
 |--- client            [All client side resources (styles/scripts/images/etc.)]
 |   |--- css           [Stylesheets - regular css or sass (.css/.scss)]
 |   |--- js            [Javascript files (.js)]
 |   |--- img           [Images]
 |   |--- lib           [Third party libraries js/css/fonts/etc; managed via bower]
 |
 |--- test              [Test files]
 |   |--- client        [Client side testing files]
 |   |--- server        [Server side testing files]
 |   |--- e2e           [End to end test files]
 |
 |--- logs              [Directory for log files]
 |
 |--- Gruntfile.js      [Grunt configuration file - provides basic tasks]
 |--- package.json      [Package configuration file - basic app info; node dependencies]
 |--- bower.json        [Client side dependency configuration file]
 |--- .bowerrc          [Configures bower behavior]
 |--- .jshintrc         [Configuration file containing JavaScript linting settings]
 |--- .gitignore        [List of files to be ignored by git]

```
The application and test code is completely self contained within the `server`, `client` and `test` directories respectively. All files under `client` are client side files that are loaded and executed on the browser. All other JavaScript files are intended to run on the server.

##CommonJS & AngularJS
The project template is designed to use both AngularJS on the client side, with modules defined in accordance with the [CommonJS](http://www.commonjs.org/) module specifications.

In other words, client side modules are written like they are NodeJS modules, using the familiar `module.exports= ...` pattern to export entities that the module is exposing. This approach has some advantages over using client modules defined as [AMD](http://en.wikipedia.org/wiki/Asynchronous_module_definition), including (but not limited to):

* **Homogenous Code**: Writing javascript code for the server and the client will now follow similar patterns, making it easier for the developer to work with an stack that uses JavaScript on both the front end and back end
* **Simplicity**: CommonJS modules are simpler to develop, requiring lesser configuration than AMD modules. This is especially true when working with AngularJS.

It is important to note that CommonJS modules cannot be directly loaded and into the browser, and must be prepared for execution in the browser by using a tool -  [browserify](http://http://browserify.org/). A comprehensive overview of browserify, including interesting details on how it works can be found in the [browserify handbook](https://github.com/substack/browserify-handbook).

##Development Workflow

This project template includes a `Gruntfile` that contains task definitions for most common development activities. This includes - linting, testing (client, server and e2e), building, and bumping version numbers. 

The template and the Gruntfile have been designed to work with each other, and it is strongly recommended that the tasks defined in the Gruntfile be leveraged to the maximum extent possible. 

Some commonly used tasks are described below:

### Running Tests

#### Test Types
The template currently supports three forms of tests:

* `client`: These are client side tests that are aimed at testing JavaScript code written for the browser
* `server`: These are tests aimed at testing server side JavaScript code. This includes testing of server side api and routes
* `e2e`: These are end to end tests, intended for testing user interface behavior. These tests could also exercise back and and client side behavior, but it is recommended that those tests be developed as server or client side test scripts respectively.

#### Test Modes

Tests can be run against the code in one of two following modes:

* `dev`: This is the default mode, and is designed to run tests against uncompiled sources. Any artifacts that require compiling will be compiled on the fly, and exercised using test scripts
* `build`: This mode is intended for use when tests have to be executed against built artifacts. The sources must be built (using the `grunt build` task) prior to running these tests.

>It is important to note that the same tests scripts will be used for `dev` and `build` modes. Running tests in `dev` mode is faster, and is typically intended for use during active development. Testing in `build` mode typically happens once some development is complete, and the code is being prepared for commit and/or deployment

### Test Driven Development
Tasks within the grunt file can be used to enable [Test Driven Development](http://en.wikipedia.org/wiki/Test-driven_development), where tests are automatically executed when changes are detected in source or test files. This can be achieved by running the `grunt monitor:<task>` task.

For example, grunt can be used to watch for file changes and run client side tests when changes are detected by executing:
```
grunt monitor:client
```
Similarly, grunt can be asked to execute linting checks, server side tests or end to end tests by using `lint`, `server` or `e2e` as the tasks respectively. See help for more information.

### Build
Using the `build` task triggers a complete build of all sources, and generates build artifacts, including compiled and compressed javascript files. Any `.sass` files are also compiled into `.css` files and are combined and minified into a single application css file.

```
grunt build
```

The `build` task merely performs a build, but does not run any tests against the built artifacts. It is strongly recommended that additional tests be executed (either manually, or by using the `grunt package` task) against the built artifacts prior to deployment

### Package
The `package` task triggers a complete build of all sources, runs tests against the built artifacts, and creates a `.zip` archive that can be used to deploy the application on to a server. 

```
grunt package
```

### Additional Tasks
The Gruntfile defines tasks in addition to those described above, and more information on these tasks can be obtained by running:
```
grunt help
```

##Usage

###Cloning
This template may be used by cloning the repository and subsequently pointing the cloned version to an upstream remote repository.

Given that this is a starter template, it is optimal if the repository is cloned with no history by executing
```
git clone <url> --depth 0
```
Once the template has been cloned, the upstream repo that this project points to may be changed by executing
```
git remote remove origin
git remote add origin <url>
```
Alternately, the developer can choose to delete the `.git` directory, and reinitialize git by executing:
```
rm -rf .git
git init
```
