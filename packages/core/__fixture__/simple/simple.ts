class Message {
  code: number = 0;
}

class Child {
  name: string = '';
}

export class Simple extends Message {
  /* Name field */
  name: string;
  /** Age */
  age: number;
  child: Child;
  grandChildren: Child[];

  constructor(name: string, age: number, child: Child, grandChildren: Child[]) {
    super()
    this.name = name
    this.age = age
    this.child = child
    this.grandChildren = grandChildren
  }
}

export class SimpleButOptional {
  /** Name field */
  name?: string;
  /** Age */
  age?: number;
  child?: Child;
}

export class SimpleButUnion {
  /** Name field */
  name: string | undefined;
  /** Age */
  age: number | undefined;
  child: Child | undefined;
}
