const test           = require('ava')
const { Assertions } = require('ava/lib/assert.js')
const fromEntries    = require('fromentries') // XXX not available in node v10

const {
    enumerate,
    enumerator,
    generate,
    generator,
    unfold,
} = require('..')

const toString = {}.toString
const booleans = [true, false]
const digits = Array.from({ length: 10 }, (_, i) => i)
const words = ['foo', 'bar', 'baz']

const isGenerator = value => {
    return value
        && (Symbol.iterator in value)
        && (toString.call(value) === '[object Generator]')
}

// XXX hack to add methods to AVA's `t` object until official support for custom
// assertions is added: https://github.com/avajs/ava/issues/1094
Object.assign(Assertions.prototype, {
    isError (fn, want) {
        let error

        try {
            fn()
        } catch (e) {
            error = e
        }

        this.assert(error)
        this.assert(error instanceof Error)
        want(error)
    }
})

test('exports', t => {
    t.is(generate, enumerate)
    t.is(generator, enumerator)
})

test('enumerator returns a generator', t => {
    t.true(isGenerator(enumerator(digits, 2)))
    t.true(isGenerator(enumerator([digits, words, booleans])))
})

test('enumerate returns an array', t => {
    t.true(Array.isArray(enumerate(digits, 2)))
    t.true(Array.isArray(enumerate([digits, words, booleans])))
})

test('empty', t => {
    t.deepEqual(enumerate(digits, 0), [[]])
    t.deepEqual(enumerate([]), [[]])
    t.deepEqual(Array.from(enumerator(digits, 0)), [[]])
    t.deepEqual(Array.from(enumerator([])), [[]])
})

test('single symbol', t => {
    const single1 = enumerate([true], 2)
    const single2 = enumerate([[true], [false]])

    t.snapshot(single1)
    t.snapshot(single2)
    t.deepEqual(Array.from(enumerator([true], 2)), single1)
    t.deepEqual(Array.from(enumerator([[true], [false]])), single2)
})

test('single alphabet', t => {
    const single = enumerate(digits, 2)

    t.snapshot(single)
    t.deepEqual(Array.from(enumerator(digits, 2)), single)
})

test('multiple alphabets', t => {
    const multiple = enumerate([booleans, digits, words])

    t.snapshot(multiple)
    t.deepEqual(Array.from(enumerator([booleans, digits, words])), multiple)
})

test('error', t => {
    const invalid = name => error => {
        t.assert(error instanceof TypeError)
        t.regex(error.message, RegExp(`Invalid ${name}\\b`))
        t.assert('value' in error)
    }

    t.isError(() => enumerate(digits, Math.PI), invalid('length'))
    t.isError(() => enumerate(digits, Infinity), invalid('length'))
    t.isError(() => enumerate(digits, 'foo'), invalid('length'))
    t.isError(() => enumerate(digits, []), invalid('length'))
    t.isError(() => enumerate(digits, null), invalid('length'))
    t.isError(() => Array.from(enumerator(digits, Math.PI)), invalid('length'))
    t.isError(() => Array.from(enumerator(digits, Infinity)), invalid('length'))
    t.isError(() => Array.from(enumerator(digits, 'foo')), invalid('length'))
    t.isError(() => Array.from(enumerator(digits, [])), invalid('length'))
    t.isError(() => Array.from(enumerator(digits, null)), invalid('length'))

    t.isError(() => enumerate(new Set(digits)), invalid('alphabets'))
    t.isError(() => enumerate(''), invalid('alphabets'))
    t.isError(() => Array.from(enumerator(new Set(digits))), invalid('alphabets'))
    t.isError(() => Array.from(enumerator('')), invalid('alphabets'))

    t.isError(() => enumerate(digits), invalid('alphabet'))
    t.isError(() => enumerate(digits, -1), invalid('alphabet'))
    t.isError(() => Array.from(enumerator(digits)), invalid('alphabet'))
    t.isError(() => Array.from(enumerator(digits, -1)), invalid('alphabet'))

    t.isError(() => enumerate(new Set(digits), 1), invalid('alphabet'))
    t.isError(() => enumerate('foo', 1), invalid('alphabet'))
    t.isError(() => Array.from(enumerator(new Set(digits), 1)), invalid('alphabet'))
    t.isError(() => Array.from(enumerator('foo', 1)), invalid('alphabet'))
})

test('password', t => {
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

    const candidates = enumerate(alphabets).map(it => it.join(''))
    const set = new Set(candidates)

    t.is(candidates.length, 864)
    t.is(candidates.length, set.size, 'unique')
    t.true(set.has('rosebud'))
    t.true(set.has('r053buD'))
    t.true(set.has('Rose Bud'))
    t.true(set.has('ROSEBUD'))
})

test('unfold', t => {
    const alphabets = unfold({
        color: ['red', 'black', 'pink'],
        size: ['small', 'medium', 'large'],
    })

    const products = enumerate(alphabets).map(fromEntries)

    t.snapshot(alphabets)
    t.snapshot(products)
})
