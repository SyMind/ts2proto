import * as ast from '../ast'
import type { Visitor } from '..'

export const jsDocVisitor: Visitor = {
  ClassPrototypeProperty: {
    exit(property, state) {
      if (state.field) {
        const comments = property.getDocumentationComment(state.typeChecker)
        for (const comment of comments) {
          if (comment.kind === 'text') {
            state.field.leadingComments.push(
              ast.singlelineComment(comment.text)
            )
          }
        }
      }
    }
  }
}
