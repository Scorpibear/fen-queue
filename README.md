# fen-queue
[![Build Status](https://travis-ci.org/Scorpibear/fen-queue.svg?branch=master)](https://travis-ci.org/Scorpibear/fen-queue)
[![Coverage Status](https://codecov.io/gh/Scorpibear/fen-queue/branch/master/graph/badge.svg)](https://codecov.io/gh/Scorpibear/fen-queue)
[![npm version](https://badge.fury.io/js/fen-queue.svg)](https://www.npmjs.com/package/fen-queue)

FEN queue with priorities

## Install
```
npm install fen-queue --save
```

## Usage
```javascript
const Queue = require('fen-queue');
const maxPriorities = 4;
const queue = new Queue(maxPriorities);
// or queue = new Queue() with 4 by default
const fen = 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2';
const depth = 50
const priority = 2;
queue.add({fen, depth}, priority);
// or queue.add({fen, depth}) with priority = 0 by default

## Specification
[FEN Queue spec](./spec/queue.js)