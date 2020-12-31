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

## Options

### env

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



---


Make a file with the config schema needy. —Usually this files is named `configs.ts` or `configs.js`—

```ts
// my_configs.ts
import envconfig from '@jondotsoy/envconfig';

const e = envconfig();

export = {
    port: e('PORT', 'number') ?? 3000, // number
    awsEnvironments: ['ZONE1', 'ZONE2', 'ZONE3']
        .map(zoneName => {
            const e = envconfig({
                env: process.env,
                prefix: 'AWS_',
                sufix: `_${zoneName}`,
            });

            return {
                region: e('REGION') ?? 'us-west-1',
                accessKeyId: e('ACCESS_KEY_ID', { required: true }),
                secretAccessKey: e('SECRET_ACCESS_KEY', { required: true }),
            };
        }),
};
```

Before to start the project need define the variable on environment.

> It is recommended to use the [dotenv](https://www.npmjs.com/package/dotenv) to set the environments.

*_Example Environment_*

```shell
PORT='3421'
AWS_REGION='us-west-1'
AWS_REGION_ZONE3='us-west-1'
AWS_ACCESS_KEY_ID_ZONE1='AKIDZone1'
AWS_SECRET_ACCESS_KEY_ZONE1='SECRETZone1'
AWS_ACCESS_KEY_ID_ZONE2='AKIDZone2'
AWS_SECRET_ACCESS_KEY_ZONE2='SECRETZone2'
AWS_ACCESS_KEY_ID_ZONE3='AKIDZone3'
AWS_SECRET_ACCESS_KEY_ZONE3='SECRETZone3'
```

*_Load config file_*

if is above is correct, when you require the config file this will be the result.

```ts
{
    port: 3421,
    awsEnvironments: [
        {
            region: 'us-west-1',
            accessKeyId: 'AKIDZone1',
            secretAccessKey: 'SECRETZone1'
        },
        {
            region: 'us-west-1',
            accessKeyId: 'AKIDZone2',
            secretAccessKey: 'SECRETZone2'
        },
        {
            region: 'us-west-2',
            accessKeyId: 'AKIDZone3',
            secretAccessKey: 'SECRETZone3'
        }
    ]
}
```

