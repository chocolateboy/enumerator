# enumerator

[![Build Status](https://github.com/chocolateboy/enumerator/workflows/test/badge.svg)](https://github.com/chocolateboy/enumerator/actions?query=workflow%3Atest)
[![NPM Version](https://img.shields.io/npm/v/@chocolatey/enumerator.svg)](https://www.npmjs.org/package/@chocolatey/enumerator)

<!-- TOC -->

- [NAME](#name)
- [FEATURES](#features)
- [INSTALLATION](#installation)
- [SYNOPSIS](#synopsis)
- [DESCRIPTION](#description)
  - [Why?](#why)
  - [Why not?](#why-not)
- [EXPORTS](#exports)
  - [enumerate](#enumerate)
  - [enumerator](#enumerator)
  - [unfold](#unfold)
- [EXAMPLES](#examples)
  - [Generating passwords](#generating-passwords)
  - [Combining options](#combining-options)
- [DEVELOPMENT](#development)
- [COMPATIBILITY](#compatibility)
- [SEE ALSO](#see-also)
- [VERSION](#version)
- [AUTHOR](#author)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- TOC END -->

# NAME

enumerator - generate a sequence of values in lexicographical order

# FEATURES

- no dependencies
- &lt; 510 B minified + gzipped
- fully typed (TypeScript)
- CDN builds (UMD): [jsDelivr][], [unpkg][]

# INSTALLATION

```
$ npm install @chocolatey/enumerator
```

# SYNOPSIS

```javascript
import { enumerate, enumerator } from '@chocolatey/enumerator'

const bits = [0, 1]
const bools = [false, true]
const words = ['foo', 'bar', 'baz', 'quux']

// generator
for (const value of enumerator([words, bits])) {
    console.log(value) // ["foo", 0], ["foo", 1], ["bar", 0] ... ["quux", 1]
}

// array
enumerate(bits, 2) // [[0, 0], [0, 1], [1, 0], [1, 1]]
```

# DESCRIPTION

Enumerator generates a sequence of values in lexicographical order. Each value
is a tuple (array) of symbols drawn from a custom alphabet for each index in
the tuple. Symbols can be of any type.

The mechanism for generating the values is the same as an odometer, i.e. the
rightmost dial/column is incremented for each value, moving left each time a
dial rolls over, and halting when the leftmost dial rolls over, e.g.:

```javascript
enumerate([[0, 1], [0, 1]]) // [[0, 0], [0, 1], [1, 0], [1, 1]]
```

In this example, the same alphabet is used for each position. As a shorthand, a
single alphabet can be repeated n times by supplying n as the second argument,
e.g.:

```javascript
enumerate([0, 1], 2) // [[0, 0], [0, 1], [1, 0], [1, 1]]
```

## Why?

> Because we often face problems in which an exhaustive examination of all
> cases is necessary or desirable.

— Donald Knuth, *The Art of Computer Programming*, Section 7.2.1.1, Generating All <i>n</i>-Tuples.

## Why not?

> Some authors call this the task of *enumerating* all of the possibilities; but
> that's not quite the right word, because "enumeration" most often means that
> we merely want to *count* the total number of cases, not that we actually want
> to look at them all.

— *Ibid.*

# EXPORTS

## enumerate

- **Type**:
  - `<T>(alphabet: T[], length: number) => Array<T[]>`
  - `<T>(alphabets: T[][]) => Array<T[]>`
- **Alias**: `generate`

```javascript
import { enumerate } from '@chocolatey/enumerator'

enumerate([0, 1], 2) // [[0, 0], [0, 1], [1, 0], [1, 1]]
```

Takes an array of alphabets, or a single alphabet and a length (number of times
to repeat the alphabet), and returns an array of all the permutations of
symbols from each alphabet in lexicographical order.

This is a wrapper around [`enumerator`](#enumerator-1) which gathers the generated
values into an array, i.e. the following are equivalent:

```javascript
const array1 = enumerate(...args)
const array2 = Array.from(enumerator(...args))
```

## enumerator

- **Type**:
  - `<T>(alphabet: T[], length: number) => Generator<T[]>`
  - `<T>(alphabets: T[][]) => Generator<T[]>`
- **Alias**: `generator`

```javascript
import { enumerator } from '@chocolatey/enumerator'

for (const value of enumerator([0, 1], 2)) {
    console.log(value) // [0, 0], [0, 1], [1, 0], [1, 1]
}
```

Takes an array of alphabets, or a single alphabet and a length (number of times
to repeat the alphabet), and yields all the permutations of symbols from each
alphabet in lexicographical order.

## unfold

- **Type**: `<V>(obj: Record<string, V | V[]>) => [string, V][][]`

```javascript
import { unfold } from '@chocolatey/enumerator'

const options = {
    color: ['black', 'pink'],
    size: ['small', 'large'],
    discount: false,
}

const alphabets = unfold(options)
```

```json
[
    [["color", "black"], ["color", "pink"]],
    [["size", "small"], ["size", "large"]],
    [["discount", false]]
]
```

Takes a plain object and flattens it into an array of arrays of key/value pairs
suitable for use as alphabets. The object is unchanged. The object's values are
coerced to arrays, so if a single value is already an array, it will need to be
wrapped in another array, e.g.:

```javascript
// before x
const data = {
    loc: [x, y],
}

// after ✔
const data = {
    loc: [[x, y]],
}
```

# EXAMPLES

## Generating passwords

Suppose you've protected a Word document or zipfile with the password
"rosebud", but can't remember if any letters were uppercase, if it was one word
or two, or if there were any substitutions. A list of candidate passwords can
be generated by:

```javascript
const alphabets = [
    ['r', 'R'],
    ['o', 'O', '0'],
    ['s', 'S', '5'],
    ['e', 'E', '3'],
    ['', ' '],
    ['b', 'B'],
    ['u', 'U'],
    ['d', 'D'],
]

const passwords = enumerate(alphabets).map(it => it.join(''))
```

This generates 864 different candidates, including "rosebud", "r053buD",
"Rose Bud", and "ROSEBUD".

## Combining options

Although any types can be used as symbols, a specific task may require some
data munging to encode its choices as alphabets. To this end, a helper
function, [`unfold`](#unfold), is available which translates a plain object
into an array of alphabets of key/value pairs representing an option or
feature.

For example, if a product is available with the following options:

- color: red, black, pink
- size: small, medium, large

\- the permutations can be generated with:

```javascript
import { enumerator, unfold } from '@chocolatey/enumerator'

const alphabets = unfold({
    color: ['red', 'black', 'pink'],
    size: ['small', 'medium', 'large'],
})

const products = enumerate(alphabets).map(Object.fromEntries)
```

\- which yields the following result:

```javascript
[
    { color: 'red', size: 'small' },
    { color: 'red', size: 'medium' },
    { color: 'red', size: 'large' },
    { color: 'black', size: 'small' },
    { color: 'black', size: 'medium' },
    { color: 'black', size: 'large' },
    { color: 'pink', size: 'small' },
    { color: 'pink', size: 'medium' },
    { color: 'pink', size: 'large' }
]
```

# DEVELOPMENT

<details>

<!-- TOC:ignore -->
## NPM Scripts

The following NPM scripts are available:

- build - compile the library for testing and save to the target directory
- build:doc - generate the README's TOC (table of contents)
- build:release - compile the library for release and save to the target directory
- clean - remove the target directory and its contents
- rebuild - clean the target directory and recompile the library
- repl - launch a node REPL with the library loaded
- test - recompile the library and run the test suite
- test:run - run the test suite
- typecheck - sanity check the library's type definitions

</details>

# COMPATIBILITY

- [Maintained Node.js versions](https://github.com/nodejs/Release#readme) and compatible browsers

# SEE ALSO

<!-- TOC:ignore -->
## JavaScript

- [@kingjs/enumerable.from-each](https://www.npmjs.com/package/%40kingjs%2Fenumerable.from-each)
- [@kingjs/odometer](https://www.npmjs.com/package/@kingjs/odometer)

<!-- TOC:ignore -->
## Perl

- [Algorithm::Odometer::Tiny](https://metacpan.org/pod/Algorithm::Odometer::Tiny)

# VERSION

1.0.0

# AUTHOR

[chocolateboy](https://github.com/chocolateboy)

# COPYRIGHT AND LICENSE

Copyright © 2020-2021 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the
terms of the [Artistic License 2.0](https://www.opensource.org/licenses/artistic-license-2.0.php).

[jsDelivr]: https://cdn.jsdelivr.net/npm/@chocolatey/enumerator@1.0.0/dist/index.umd.min.js
[unpkg]: https://unpkg.com/@chocolatey/enumerator@1.0.0/dist/index.umd.min.js
