import { expectError, expectType } from 'tsd'
import { enumerate, enumerator }   from '.'

expectError(enumerate())
expectError(enumerate(42))
expectError(enumerate('foo'))
expectError(enumerate('foo', 42))
expectError(enumerate({}))
expectError(enumerate({}, 42))
expectError(enumerate(['foo'], []))
expectError(enumerate([['foo']], []))

expectError(enumerator())
expectError(enumerator(42))
expectError(enumerator('foo'))
expectError(enumerator('foo', 42))
expectError(enumerator({}))
expectError(enumerator({}, 42))
expectError(enumerator(['foo'], []))
expectError(enumerator([['foo']], []))

expectType<Generator<(string | number | true)[], void, unknown>>(enumerator([1, 'foo', true], 3))
expectType<Generator<(string | number | boolean)[], void, unknown>>(enumerator([1, 'foo', true, false], 3))
expectType<Generator<(string | number | boolean)[], void, unknown>>(enumerator([[true], [1, 2], ['foo', 'bar']]))
expectType<Generator<(string | number | boolean)[], void, unknown>>(enumerator([[true, false], [1, 2], ['foo', 'bar']]))

expectType<(string | number | true)[][]>(enumerate([1, 'foo', true], 3))
expectType<(string | number | boolean)[][]>(enumerate([1, 'foo', true, false], 3))
expectType<(string | number | boolean)[][]>(enumerate([[true], [1, 2], ['foo', 'bar']]))
expectType<(string | number | boolean)[][]>(enumerate([[true, false], [1, 2], ['foo', 'bar']]))
