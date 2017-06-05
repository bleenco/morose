
<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1796022/26799017/160416cc-4a34-11e7-919e-91d0a2359d8c.png">
</p>

# morose

[![Build Status](https://travis-ci.org/bleenco/morose.svg?branch=master)](https://travis-ci.org/bleenco/morose)

Run npm registry or npm proxy on your own servers.

### Use cases

- Use private packages.

If you want to use all benefits of npm package system in your company without sending all code to the public, and use your private packages just as easy as public ones.

- Cache npmjs.org registry.

If you have more than one server you want to install packages on, you might want to use this to decrease latency (presumably "slow" npmjs.org will be connected to only once per package/version) and provide limited failover (if npmjs.org is down, we might still find something useful in the cache).

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

### Setting up npm config to use morose

```sh
npm set registry http://localhost:10000
```

### Hacking on morose

#### Running from source

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

#### LICENCE

**MIT**
