import * as path from 'path'
import * as ts from 'typescript'
import * as ast from './ast'
import { CodeGenerator } from './codegen'
import { classPlugin } from './plugins/classPlugin'
import { jsDocPlugin } from './plugins/jsDocPlugin'

export * as ast from './ast'

interface State extends Record<string, any> {
  proto: ast.Proto
  context: TraversalContext
  typeChecker: ts.TypeChecker
}

type VisitNodeFunction<P> = (
  node: P,
  state: State,
) => void

interface VisitNodeObject<P> {
  enter?: VisitNodeFunction<P>
  exit?: VisitNodeFunction<P>
}

export type Visitor = {
  Program?: VisitNodeObject<ts.Program>
  SourceFile?: VisitNodeObject<ts.SourceFile>
  ClassDeclaration?: VisitNodeObject<ts.Symbol>
  ClassPrototypeProperty?: VisitNodeObject<ts.Symbol>
}

export type Plugin = () => Visitor

class TraversalContext {
  private state: State

  private checker: ts.TypeChecker

  constructor(private program: ts.Program, private visitors: Visitor[]) {
    this.state = {
      proto: ast.proto(),
      context: this,
      typeChecker:  program.getTypeChecker()
    }
    this.checker = program.getTypeChecker()
  }

  visitProgram(): void {
    for (const visitor of this.visitors) {
      visitor.Program?.enter?.(this.program, this.state)
    }

    for (const sourceFile of this.program.getSourceFiles()) {
      this.visitSourceFile(sourceFile)
    }

    for (const visitor of [...this.visitors].reverse()) {
      visitor.Program?.exit?.(this.program, this.state)
    }
  }

  visitSourceFile(sourceFile: ts.SourceFile): void {
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, node => {
        if (ts.isClassDeclaration(node) && node.name) {
          const symbol = this.checker.getSymbolAtLocation(node.name)
          if (symbol) {
            this.visitClassDeclaration(symbol)
          }
        }
      })
    }
  }

  visitClassDeclaration(symbol: ts.Symbol): void {
    for (const visitor of this.visitors) {
      visitor.ClassDeclaration?.enter?.(symbol, this.state)
    }

    const classType = this.checker.getTypeOfSymbol(symbol)
    const prototypeSymbol = this.checker.getPropertyOfType(classType, 'prototype')!
    const prototypeType = this.checker.getTypeOfSymbol(prototypeSymbol)
    
    this.checker.getPropertiesOfType(prototypeType).forEach(
      property => this.visitClassPrototypeProperty(property)
    )

    for (const visitor of [...this.visitors]) {
      visitor.ClassDeclaration?.exit?.(symbol, this.state)
    }
  }

  visitClassPrototypeProperty(symbol: ts.Symbol): void {
    for (const visitor of this.visitors) {
      visitor.ClassPrototypeProperty?.enter?.(symbol, this.state)
    }

    for (const visitor of [...this.visitors]) {
      visitor.ClassPrototypeProperty?.exit?.(symbol, this.state)
    }
  }

  toString() {
    const codegen = new CodeGenerator()
    codegen.emitProto(this.state.proto)
    return codegen.toString()
  }
}

const DEFAULT_PLUGINS = [
  classPlugin,
  jsDocPlugin
]

interface Config {
  tsConfig: string | ts.ParsedCommandLine
  plugins?: Plugin[]
}

export function transform(config: Config): string | undefined {
  const tsConfig = (function () {
    if (typeof config.tsConfig === 'string') {
      const tsParsedConfig = ts.readJsonConfigFile(config.tsConfig, ts.sys.readFile)
      return ts.parseJsonSourceFileConfigFileContent(tsParsedConfig, ts.sys, path.dirname(config.tsConfig))
    }
    return config.tsConfig
  })()
  
  const program = ts.createProgram({
    rootNames: tsConfig.fileNames,
    options: tsConfig.options
  })

  const plugins = config.plugins ?? DEFAULT_PLUGINS
  const visitors: Visitor[] = plugins.map(plugin => plugin())

  const context = new TraversalContext(program, visitors)
  context.visitProgram()

  return context.toString()
}
