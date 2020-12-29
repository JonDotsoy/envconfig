

# envconfig

Helper to load environment with context and formatter.

- Load config from `process.env`
- Format value
- Typescript support


## How to use

Install dependency `@jondotsoy/envconfig` from npm 

```shell
$ npm i @jondotsoy/envconfig
```

Make a file with the config schema needy. —Usually this files is named `configs.ts` or `configs.js`—

```ts
// configs.ts
import envconfig from '@jondotsoy/envconfig';

const e = envconfig({ env: process.env });

export = {
    port: e('PORT', { type: 'number', required: true }), // number
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

