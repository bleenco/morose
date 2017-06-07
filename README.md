
<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1796022/26799017/160416cc-4a34-11e7-919e-91d0a2359d8c.png">
</p>

# morose

[![Build Status](https://travis-ci.org/bleenco/morose.svg?branch=master)](https://travis-ci.org/bleenco/morose)

Run npm registry or npm proxy on your own servers.

`morose` allows you to have a local npm registry with zero configuration. You don't have to install and replicate an entire CouchDB database. `morose` keeps its own small database and, if a package doesn't exist there, it asks npmjs.org for it keeping only those packages you use.

## Compatibility

`morose` is compatible with `npm` version `5` and beyond.

<p align="center">
  <img src="https://user-images.githubusercontent.com/1796022/26878368-85bc3850-4b8d-11e7-9d6b-8bee91a41280.png">
</p>

## Use cases

- Use private packages.

If you want to use all benefits of npm package system in your company without sending all code to the public, and use your private packages just as easy as public ones.

- Cache npmjs.org registry.

If you have more than one server you want to install packages on, you might want to use this to decrease latency (presumably "slow" npmjs.org will be connected to only once per package/version) and provide limited failover (if npmjs.org is down, we might still find something useful in the cache).

- Override public packages.

If you want to use a modified version of some 3rd-party package (for example, you found a bug, but maintainer didn't accept pull request yet), you can publish your version locally under the same name.

## Installation

```sh
$ npm install morose -g
```

## Usage

### Running a Server

```sh
morose
```

When you start a server for the first time, configuration is created in `~/.morose` directory.

Now you can navigate to `http://localhost:10000` in your browser where your packages can seen and searched.

### Setting up npm config to use morose

```sh
npm set registry http://localhost:10000
```

## Running tests

* server unit tests

```sh
node tests/run.js
```

* server end-to-end tests

```sh
node tests/run_e2e.js
```

* app end-to-end Protractor tests

First make sure `morose` is running, then;

```sh
npm run protractor
```

## Hacking on morose

### Running from source

1. Clone this repository

```sh
git clone https://github.com/bleenco/morose.git --depth 1
```

2. Build morose project

```sh
npm run build:prod
```

3. Link morose to have global command

```sh
npm link
```

4. Run command

```sh
morose
```

...or, you can skip steps `2.`, `3.` and `4.` and start project in dev mode

```sh
npm run dev
```

## Inspiration

`morose` is heaviliy inspired by `sinopia` and we also used some stuff from there.
The main reason to make a new package with similar behavior is that `sinopia` is not updated anymore and as far as we know some `npm` commands doesn't work there.

`morose` is build with in the way that is compatible with the newest `npm` releases.

## LICENCE

**MIT**
