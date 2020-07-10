
const isBool = (v: any): v is string => {
    return /^true|false$/i.test(v);
}

export type Types = 'number' | 'boolean' | 'string' | ((val: any) => any);

interface IEnvconfig {
    getConfig(envPath: string, options: { required: true; type: 'number'; }): number;
    getConfig(envPath: string, options: { required: true; type: 'boolean'; }): boolean;
    getConfig<T>(envPath: string, options: { required: true; type: (val: any) => T; }): T;
    getConfig(envPath: string, options: { required?: boolean; type: 'number'; }): number | undefined;
    getConfig(envPath: string, options: { required?: boolean; type: 'boolean'; }): boolean | undefined;
    getConfig<T>(envPath: string, options: { required?: boolean; type: (val: any) => T; }): T | undefined;
    getConfig(envPath: string, options: { required: true; type?: Types; }): string;
    getConfig(envPath: string, options?: { required?: boolean; type?: Types; }): string | undefined;
}

interface EnvconfigOptions {
    env?: any;
    prefix?: string;
    sufix?: string;
}

interface EnvconfigGetConfigOptions {
    required?: boolean;
    type?: Types;
}

export class Envconfig {
    constructor(private options?: EnvconfigOptions) { }

    readonly env = this.options?.env ?? process.env;
    readonly prefix = this.options?.prefix;
    readonly sufix = this.options?.sufix;

    getConfig: IEnvconfig['getConfig'] = (envPath: string, options?: EnvconfigGetConfigOptions) => {
        const required = options?.required ?? false;
        const type: Types = options?.type ?? 'string';

        const nextEnvPath = `${this.prefix ?? ''}${envPath}`;

        const v = this.env[nextEnvPath] ?? this.env[`${nextEnvPath}${this.sufix ?? ''}`];

        if (required && !v) {
            if (this.sufix) {
                throw new Error(`Cannot found config ${nextEnvPath}${this.sufix ?? ''} or ${nextEnvPath}`);
            } else {
                throw new Error(`Cannot found config ${nextEnvPath}`);
            }
        }

        switch (type) {
            case 'number': return Number(v);
            case 'boolean': return isBool(v) ? JSON.parse(v.toLowerCase()) : undefined;
        }

        if (typeof type === 'function') return type(v);

        return v;
    }
}

export const envconfig = (options?: EnvconfigOptions): IEnvconfig['getConfig'] => {
    const e = new Envconfig(options);
    return e.getConfig.bind(e);
}

export default envconfig;
