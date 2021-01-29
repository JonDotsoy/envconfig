# envconfig

Envconfig is a helper zero-dependency module to load environment values with formatter 😉.

**Features:**

- Default load config from [`process.env`](https://nodejs.org/dist/latest-v8.x/docs/api/process.html#process_process_env)
- Formatter value using option *`[type]`*: `e('ENV', { type: Types }) => Types | undefined` or `e('ENV', Types) => Types | undefined`
    - Formatters supported:
        - `string` formatter (**Default**): Ex. `e('ENV') => string | undefined`
        - `number` formatter: Ex. `e('ENV', { type: 'number' }) => number | undefined`
        - `bigint` formatter: Ex. `e('ENV', { type: 'bitint' }) => bitint | undefined`
        - `boolean` formatter: Ex. `e('ENV', { type: 'boolean' }) => boolean | undefined`
        - Custom formatter: Ex. `e('ENV', { type: v => new Date(v) }) => Date | undefined`
- Typescript support
    - Samples:
        -  `e('ENV', 'number') => number | undefined`
        -  `e('ENV', v => new Date(v)) => Date | undefined`
- Assert values
    - Samples:
        -  `e('ENV', { type: 'number', required: true }) => number`
        -  `e('ENV', { type: v => new Date(v), required: true }) => Date`


**Example**

```ts
// config.ts
import envconfig from '@jondotsoy/envconfig';

const e = envconfig();

export const config = {
  port: e('PORT', 'number') ?? 3000,
  mongouri: e('MONGODB', 'string', true),
}
```

**Other Example**

```ts
// config.ts
import envconfig from '@jondotsoy/envconfig';
import ow from 'ow';

const e = envconfig();

const toRules = (env: any): { key: string, value: string }[] => {
  const obj = JSON.parse(env);
  
  ow(obj, 'RULES', ow.array.ofType(ow.object.exactShape({
    key: ow.string,
    value: ow.string,
  })));

  return obj;
}

export const config = {
  port: e('PORT', 'number') ?? 3000,
  mongouri: e('MONGODB', 'string', true),
  rules: e('RULES', toRules, true),
}
```


## How to use

Install dependency `@jondotsoy/envconfig`

```shell
# With npm
$ npm i @jondotsoy/envconfig
```

## Usage

Require and configure envconfig.

```ts
// my_configs.ts
import envconfig from '@jondotsoy/envconfig';

const e = envconfig();
```

Use your instance `e` in your code. For example, using PORT env if exists or assign a default value.

```ts
const port: number = e('PORT', 'number') ?? 3000;
```

## Options `envconfig([{ env?, prefix?, sufix?, optionalPrefix?, optionalSuffix? }]): e(key: string)`

### env

- Optional
- Type:
> ```ts
> declare type env = { [k: string]: string }
> ```
- Default: `process.env`

Specify origins data, the method `e()` is using this value to read and transform values.

```ts
const e = envconfig({ env: { PORT: '6000' } });

const port: number = e('PORT', 'number', true);
```

### prefix

- Optional
- Type:
> ```ts
> declare type prefix = string
> ```

Used to simplify the reading values that contain prefixes on all values required. Its util to complex strategies.

```ts
const e = envconfig({
  env: { AWS_ACCESS_KEY_ID: 'a123', AWS_SECRET_ACCESS_KEY: 'abcdeaw12343****' },
  prefix: 'AWS_',
});

const accessKeyId: string = e('ACCESS_KEY_ID', 'string', true);
const secretAccessKey: string = e('SECRET_ACCESS_KEY', 'string', true);
```

### sufix

- Optional
- Type:
> ```ts
> declare type sufix = string
> ```

Used to simplify the reading values that contain sufixes on all values required. Its util to complex strategies.

```ts
const e = envconfig({
  env: { KEY_STAGING: 'a123', SECRET_STAGING: 'abcdeaw12343****' },
  sufix: '_STAGING',
});

const key: string = e('KEY', 'string', true);
const secret: string = e('SECRET', 'string', true);
```



### optionalPrefix

- Optional
- Type:
> ```ts
> declare type optionalPrefix = string
> ```

Used to simplify the reading the values that can have a suffix. It has preferer the key with the suffix if not exists the key with the suffix this to find a key without the suffix.

**Demo 1**

```ts
const e = envconfig({
  env: { API_KEY: 'abc123', API_KEY_STAGING: 'def456' },
  optionalSuffix: '_STAGING',
});

const apiKey: string = e('API_KEY', 'string', true);

assert(apiKey).to.be.equal('def456');
```

**Demo 2**

```ts
const e = envconfig({
    env: { API_KEY: 'abc123', API_KEY_PRODUCTION: 'def456' },
    sufix: '_STAGING',
});

const apiKey: string = e('API_KEY', 'string', true);

assert(apiKey).to.be.equal('abc123');
```



### optionalSuffix

- Optional
- Type:
> ```ts
> declare type sufix = string
> ```

Used to simplify the reading the values that can have a sufix. It has preferer the key with the sufix if not exists the key with the sufix this to find a key without the sufix.

**Demo 1**

```ts
const e = envconfig({
  env: { API_KEY: 'abc123', API_KEY_STAGING: 'def456' },
  optionalSuffix: '_STAGING',
});

const apiKey: string = e('API_KEY', 'string', true);

assert(apiKey).to.be.equal('def456');
```

**Demo 2**

```ts
const e = envconfig({
    env: { API_KEY: 'abc123', API_KEY_PRODUCTION: 'def456' },
    optionalSuffix: '_STAGING',
});

const apiKey: string = e('API_KEY', 'string', true);

assert(apiKey).to.be.equal('abc123');
```

## Options `e(key: string[, { type?: Types, required?: boolean }])`

- Other Syntax: `e(key: string[, type: Types[, required: boolean]])`

### key

- required
- Type:
```ts
declare type key = string
```

It's a string that is a referrer to the key in the object env.

```ts
const key = 'PORT'
const env = { PORT: '1234' }

const e = envconfig({ env })

const port = e(key) // '1234'
```

### type

- Optional
- Type:
```ts
declare type Types = 'number' | 'boolean' | 'string' | 'bigint' | ((v: string) => any);
```

This param is optional, a string or a function. This is used to indicate how is interpreted the value found. If the value found is undefined that value will not be interpreted.

If is equal to `string`, the value found is transformed to [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String).

```ts
const port = e('PORT', 'string')

assert.ok(typeof port === 'string')
```

If is equal to `number`, the value found is transformed to [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number).

```ts
const port = e('PORT', 'number')

assert.ok(typeof port === 'number')
```

If is equal to `boolean`, the value found is transformed to [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean).

```ts
const verbose = e('VERBOSE', 'boolean')

assert.ok(typeof verbose === 'boolean')
```

If is equal to `bigint`, the value found is transformed to [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt).

```ts
const memmax = e('MEMMAX', 'bigint')

assert.ok(typeof memmax === 'bigint')
```

If is a function, it is used to transform value, only if is  not undefined the value found.

**Demo 1**

```ts
const toDate = (v) => new Date(v)

const openService = e('OPEN_SERVICE', toDate)

assert.ok(openService instanceof Date)
```

**Demo 2**

```ts
const base64ToBuffer = (v) => Buffer.from(v, 'base64')

const keySecret = e('KEY_SECRET', base64ToBuffer)

assert.ok(keySecret instanceof Buffer)
```

### required

- Optional
- Type:
```ts
declare type required = boolean
```

if is equal to `true` the value found will have be not undefined else it throw a error.
