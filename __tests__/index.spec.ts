import test from 'ava'
import * as fs from 'fs'
import * as path from 'path'
import { transform } from '../src'

test('basic', t => {
    const rootName = path.resolve(__dirname, '../__fixture__/simple/simple.ts')
	const result = transform([rootName])

    console.log('result: ', result)
})
