
const isBoolStr = (v: any): v is string => /^true|false$/i.test(v)
const isNumStr = (v: any): v is string => /^\d+(\.\d+)?$/.test(v)
const isBigIntStr = (v: any): v is string => /^\d+n$/.test(v)

export type Types = 'number' | 'boolean' | 'string' | ((v: any) => any);

interface EnvconfigOptions<T extends { [k: string]: string } = any> {
    env?: T;
    prefix?: string;
    sufix?: string;
}

interface EnvconfigGetConfigOptions<T extends Types, E extends boolean> {
    required?: E;
    type?: T;
}

type R1<B extends Types> =
    B extends 'string' ? string
    : B extends 'number' ? number
    : B extends 'boolean' ? boolean
    : B extends (v: any) => infer R ? R
    : never

type R<T extends Types, E extends boolean> =
    E extends true ? R1<T>
    : E extends false ? R1<T> | undefined
    : never

export class Envconfig<P extends { [k: string]: string } = any> {
    constructor(private options?: EnvconfigOptions<P>) { }

    readonly env = this.options?.env ?? process.env;
    readonly prefix = this.options?.prefix;
    readonly sufix = this.options?.sufix;

    getConfig<T extends Types = 'string', E extends boolean = false>(envPath: keyof P, options?: EnvconfigGetConfigOptions<T, E>): R<T, E> {
        const required: boolean = options?.required ?? false;
        const type: Types = options?.type ?? 'string';

        const nextEnvPath = `${this.prefix ?? ''}${envPath}`;

        const v: any = this.env[nextEnvPath] ?? this.env[`${nextEnvPath}${this.sufix ?? ''}`];

        if (required && !v) {
            if (this.sufix) {
                throw new Error(`Cannot found config ${nextEnvPath}${this.sufix ?? ''} or ${nextEnvPath}`);
            } else {
                throw new Error(`Cannot found config ${nextEnvPath}`);
            }
        }

        switch (type) {
            case 'number': return isNumStr(v) ? Number(v) as any
                : isBigIntStr(v) ? BigInt(v.slice(0, -1)) as any
                    : undefined;
            case 'boolean': return isBoolStr(v) ? JSON.parse(v.toLowerCase()) : undefined;
        }

        if (typeof type === 'function') return type(v);

        return v;
    }
}

export const envconfig = <T extends { [k: string]: string } = any>(options?: EnvconfigOptions<T>) => {
    const e = new Envconfig<T>(options);
    return e.getConfig.bind(e);
}

export default envconfig;
