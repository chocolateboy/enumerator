const test        = require('ava')
const fromEntries = require('fromentries') // XXX not available in node v10

const {
    unfold,
    enumerate,
    enumerator,
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

test('single element', t => {
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
    const invalid = name => ({
        instanceOf: TypeError,
        message: RegExp(`Invalid ${name}\\b`),
    })

    t.throws(() => enumerate(digits, Math.PI), invalid('length'))
    t.throws(() => enumerate(digits, Infinity), invalid('length'))
    t.throws(() => enumerate(digits, 'foo'), invalid('length'))
    t.throws(() => enumerate(digits, []), invalid('length'))
    t.throws(() => enumerate(digits, null), invalid('length'))
    t.throws(() => Array.from(enumerator(digits, Math.PI)), invalid('length'))
    t.throws(() => Array.from(enumerator(digits, Infinity)), invalid('length'))
    t.throws(() => Array.from(enumerator(digits, 'foo')), invalid('length'))
    t.throws(() => Array.from(enumerator(digits, [])), invalid('length'))
    t.throws(() => Array.from(enumerator(digits, null)), invalid('length'))

    t.throws(() => enumerate(new Set(digits)), invalid('alphabets'))
    t.throws(() => enumerate(''), invalid('alphabets'))
    t.throws(() => Array.from(enumerator(new Set(digits))), invalid('alphabets'))
    t.throws(() => Array.from(enumerator('')), invalid('alphabets'))

    t.throws(() => enumerate(digits), invalid('alphabet'))
    t.throws(() => enumerate(digits, -1), invalid('alphabet'))
    t.throws(() => Array.from(enumerator(digits)), invalid('alphabet'))
    t.throws(() => Array.from(enumerator(digits, -1)), invalid('alphabet'))

    t.throws(() => enumerate(new Set(digits), 1), invalid('alphabet'))
    t.throws(() => enumerate('foo', 1), invalid('alphabet'))
    t.throws(() => Array.from(enumerator(new Set(digits), 1)), invalid('alphabet'))
    t.throws(() => Array.from(enumerator('foo', 1)), invalid('alphabet'))
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

test('product', t => {
    const alphabets = unfold({
        color: ['red', 'black', 'pink'],
        size: ['small', 'medium', 'large'],
    })

    const products = enumerate(alphabets).map(fromEntries)

    t.snapshot(alphabets)
    t.snapshot(products)
})
