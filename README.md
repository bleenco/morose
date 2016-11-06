# morose

Lightweight alternative for private npm registry heavily inspired by node-reggie.

morose is currently in development mode. It currently supports:

- registering/uploading packages
- supports basic semver wildcards (1.1.x) and ranges
- a few basic routes to see what's registered
- all packages info is saved in cache

Here's what it doesn't do yet:

- authentication on publish
- searching for packages

## Installation

```sh
$ npm install morose -g
```

## Usage 

#### Running a Server

```sh
morose-server
```

#### Publishing package to registry

`cd` into package root directory you want to publish (should have package.json file) and: 

```sh
morose publish [url:port]
```
where `url` is the HTTP url where `morose-server` is running. ie: 

```sh
morose publish https://morose.example.com:4720
```

you can ofc omit port if morose server is running on port 80.

#### Installing package from morose server

```sh
npm install https://morose.example.com:4720/package/[package-name]/latest
```
or
```sh
npm install https://morose.example.com:4720/package/[package-name]/1.1.0
```

#### LICENCE

MIT
