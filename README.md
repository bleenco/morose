
<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1796022/26799017/160416cc-4a34-11e7-919e-91d0a2359d8c.png">
</p>

# morose

[![Build Status](https://travis-ci.org/bleenco/morose.svg?branch=master)](https://travis-ci.org/bleenco/morose)

Run npm registry or npm proxy on your own servers.

### Use cases

- Use private packages.

If you want to use all benefits of npm package system in your company without sending all code to the public, and use your private packages just as easy as public ones.

See using private packages section for details.

- Cache npmjs.org registry.

If you have more than one server you want to install packages on, you might want to use this to decrease latency (presumably "slow" npmjs.org will be connected to only once per package/version) and provide limited failover (if npmjs.org is down, we might still find something useful in the cache).

See using public packages section for details.

- Override public packages.

If you want to use a modified version of some 3rd-party package (for example, you found a bug, but maintainer didn't accept pull request yet), you can publish your version locally under the same name.

### Installation

```sh
$ npm install morose -g
```

### Usage

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
