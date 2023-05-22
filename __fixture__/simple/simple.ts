class Message {
    code: number = 0;
}

class Child {
    name: string = '';
}

export class Simple extends Message {
    name: string;
    age: number;
    child: Child;

    constructor() {
        super()
        this.name = ''
        this.age = 0
        this.child = new Child()
    }
}
