# ts2proto

TypeScript to Protocol Buffers 🍭

## Example

Take a TypeScript:

```ts
export class User {
    name?: string;
    age?: number;
}
```

Run ts2proto:

```bash
npx @ts2proto/cli foo.ts
```

GET a Protocol Buffers:

```proto
syntax = "proto3";

message User {
  optional string name = 0;
  optional double age = 1;
}
```

## LICENSE

MIT
