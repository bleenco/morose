
<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1796022/24319396/d85567ce-111a-11e7-8ada-9112fbd2d902.png" width="400">
</p>

# morose

[![Build Status](https://travis-ci.org/bleenco/morose.svg?branch=master)](https://travis-ci.org/bleenco/morose)
[![Build status](https://ci.appveyor.com/api/projects/status/kg4h0mn3t8q8h96b/branch/master?svg=true)](https://ci.appveyor.com/project/jkuri/morose/branch/master)

Run npm registry & proxy on your own servers.

## Installation

```sh
$ npm install morose -g
```

## Usage

### Running a Server

```sh
morose
```

### Setting up npm config in client to use morose

```sh
npm set registry http://localhost:10000
```

### Use npm system

Now we can use npm commands. In the next picture we can see an example of use `npm install`.

![Alt text](https://cloud.githubusercontent.com/assets/8555269/26249157/a09fc962-3ca5-11e7-87f2-041f3c20669f.png?raw=true "Optional Title")

In the upper terminal we can see the output of a morose server and in the lower terminal the output on the client when we execute command `npm install ngx-uploader`

#### Supported npm commands:
 - npm bin
 - npm bugs
 - npm build
 - npm cache
 - npm completion
 - npm config
 - npm dedupe
 - npm docs
 - npm doctor
 - npm explore
 - npm help
 - npm init
 - npm install
 - npm install-test
 - npm link
 - npm logout
 - npm login
 - npm ls
 - npm outdated
 - npm owner
 - npm pack
 - npm ping
 - npm prune
 - npm publish
 - npm rebuild
 - npm repo
 - npm restart
 - npm root
 - npm search
 - npm shrinkwrap
 - npm star
 - npm stars
 - npm start
 - npm stop
 - npm test
 - npm uninstall
 - npm update
 - npm version
 - npm whoami

#### Npm commands waiting for implementation:
 - npm access
 - npm deprecate
 - npm dist-tag
 - npm unpublish
 - npm star
 - npm stars

#### LICENCE

MIT
