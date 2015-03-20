# Zeppelin
A decentralized marketplace for computation power

## Current limitations
- Frontend is dependent on eth/AZ backend

## Development limitations
- Frontend uses browserify, which is not compatible with ethereum.js until we upgrade to v1.0.0+ and PoC-9 in our dev environment. The problem exists because the library thinks it's running on node, but it's in fact running in the browser. This can be hacked away as a workaround until we can get rid of it.
- Frontend cannot upgrade to React v0.13 because React-router is not compatible yet.

## How do I develop?
First, install the dependencies with

    $ npm install

Start running node and watching for file updates

    $ npm run watch

Node is now running on localhost:8000, and expects eth/AZ on localhost:8080.

## How do I release?
I don't know why we would be making any releases of this yet, but...

Build, obfuscate and minify with

    $ npm run build

Deploy on node with

    $ npm run server

Success! Node is running on localhost:8000, and expects eth/AZ on localhost:8080.

## What is going on here?
The frontend is powered by react, written in ES6.
With docker-transfer integrated in the node server, Zeppelin should be function as our full stack solution outlined in Pl. Report and described in detail in the Final Report.
The frontend will then broker requests down to Ethereum, as well as communicate over whisper with workers and clients.

