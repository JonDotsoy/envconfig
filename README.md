# envconfig

Envconfig is a helper zero-dependency module to load environment values with formatter 😉.

**Features:**

- Default load config from `process.env`
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

## Options `envconfig([{ env?, prefix?, sufix? }])`

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

Used to simplify the reading the values that can have a suffix. It has preferer the key with the suffix if not exists the key with the suffix this to find a key without the suffix.

```ts
const e = envconfig({
    env: { API_KEY: 'abc123', API_KEY_STAGING: 'def456' },
    sufix: '_STAGING',
});

const apiKey: string = e('API_KEY', 'string', true);

assert(apiKey).to.be.equal('def456');
```
