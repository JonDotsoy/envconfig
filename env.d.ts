
declare module "node:test" {
  interface test {
    (description: string, options: { skip?: boolean, only?: boolean }, callback: (t: test, done: (error: unknown) => void) => void | Promise<void>): Promise<void>;
    (description: string, callback: (t: test, done: (error: unknown) => void) => void | Promise<void>): Promise<void>;
    test: test
  }

  declare const test: test;

  export = test
}
