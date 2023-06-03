import test from 'ava'
import { CodeGenerator } from '../src/codegen'
import * as ast from '../src/ast'

test('codegen', t => {
  const name = ast.field('string', 'name', 0)
  const age = ast.field('double', 'age', 1)
  const child = ast.field('Child', 'child', 2)
  const grandChildren = ast.field('Child', 'grandChildren', 3)
  const double = ast.field('double', 'code', 4)

  name.leadingComments.push(ast.singlelineComment('Name field'))

  age.leadingComments.push(ast.singlelineComment('Age'))

  grandChildren.fieldLabel = 'repeated'

  const message = ast.message(
    'Simple',
    ast.messageBody([
      name,
      age,
      child,
      grandChildren,
      double,
    ])
  )

  const service = ast.service(
    'SimpleService',
    ast.serviceBody([
      ast.rpc(
        'Search',
        'SearchRequest',
        'SearchResponse'
      )
    ])
  )

  const proto = ast.proto([
    ast.syntax('proto3'),
    message,
    service
  ])

  const generator = new CodeGenerator()
  generator.emitProto(proto)

  t.is(generator.toString(), `syntax = "proto3";

message Simple {
  // Name field
  string name = 0;
  // Age
  double age = 1;
  Child child = 2;
  repeated Child grandChildren = 3;
  double code = 4;
}

service SimpleService {
  rpc Search(SearchRequest) returns (SearchResponse);
}
`)
})
