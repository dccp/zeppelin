# Zeppelin
A decentralized marketplace for computation power

## Current limitations
- Frontend is dependent on eth/AZ backend

## Development limitations
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

    $ npm start

Success! Node is running on localhost:8000, and expects eth/AZ on localhost:8080.

## What is going on here?
The frontend is powered by react, written in ES6.
With docker-transfer integrated in the node server, Zeppelin should be function as our full stack solution outlined in Pl. Report and described in detail in the Final Report.
The frontend will then broker requests down to Ethereum, as well as communicate over whisper with workers and clients.

## TODO
- Remove all the old frontend files (js/, \*.html)
- Functionality? (Seems boring.)
- Whisper communication
- Docker-transfer backend integration

