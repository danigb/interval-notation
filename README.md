# interval-notation [![npm](https://img.shields.io/npm/v/interval-notation.svg)](https://www.npmjs.com/package/interval-notation)

[![Build Status](https://travis-ci.org/danigb/interval-notation.svg?branch=master)](https://travis-ci.org/danigb/interval-notation) [![Code Climate](https://codeclimate.com/github/danigb/interval-notation/badges/gpa.svg)](https://codeclimate.com/github/danigb/interval-notation)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

Parse music intervals in [shorthand notation](https://en.wikipedia.org/wiki/Interval_(music)#Shorthand_notation) with javascript. Given a string, obtain a hash
with interval components and properties (including interval size in semitones). Given an interval properties, build a string.

## Usage

Install via npm: `npm i --save interval-notation` and require it:

```js
var interval = require('interval-notation')
interval.parse('M3') // => { num: 3, q: 'M', dir: 1, simple: 3,
                     //      type: 'M', alt: 0, oct: 0, size: 4 }
interval.shorthand(3, 0, 0, 1) // => 'M3'
```

## Tests and documentation

You can read the [generated API documentation here](https://github.com/danigb/interval-notation/blob/master/API.md)

To run the test clone this repo and:

```
npm i
npm test
```

## License

MIT License
