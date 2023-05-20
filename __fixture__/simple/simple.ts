class Message {
    hello?: string;
}

export class Simple extends Message {
    /** Name field */
    name?: string;
    /** Age */
    age?: number;
    /** This comment will also attach */
    createdAt: Date | undefined;
    // child: Child | undefined;
    // state: StateEnum;
    // grandChildren: Child[];
    coins?: number[];
    snacks?: string[];
    // oldStates: StateEnum[];
    /** A thing (imported from thing) */
    // thing: ImportedThing | undefined;
    blobs?: Uint8Array[];
    // birthday: DateMessage | undefined;
    blob?: Uint8Array;
    enabled?: boolean;
}
