class Message {
    code: number = 0;
}

export class Simple extends Message {
    /** Name field */
    name?: string;

    /** Age */
    age?: number;
}
