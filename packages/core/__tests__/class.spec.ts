import test from 'ava'
import * as fs from 'fs'
import * as path from 'path'
import { transform } from '../src'

test('basic', t => {
  const rootName = path.resolve(__dirname, '../__fixture__/simple/simple.ts')
	const result = transform([rootName])

  const expect = fs.readFileSync(path.resolve(__dirname, '../__fixture__/simple/simple.proto'), 'utf-8')

  t.is(result, expect)
})
