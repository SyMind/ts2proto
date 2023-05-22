class Message {
    code: number = 0;
}

class Child {
    name: string = '';
}

export class Simple extends Message {
    /* Name field */
    name: string;
    age: number;
    child: Child;
    grandChildren: Child[];

    constructor() {
        super()
        this.name = ''
        this.age = 0
        this.child = new Child()
        this.grandChildren = []
    }
}
