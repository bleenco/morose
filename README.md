
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

### Setting up npm config to use morose

```sh
npm set registry http://localhost:10000
```

#### LICENCE

MIT
