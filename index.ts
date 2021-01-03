const isBooleanStr = (v: any): v is string => /^true|false$/i.test(v)
const isNumberStr = (v: any): v is string => /^\d+(\.\d+)?$/.test(v)
const isBigIntStr = (v: any): v is string => /^\d+n$/.test(v)
const notIsUndefined = <T>(v: T): v is Exclude<T, undefined> => v !== undefined

export type Types<T = any> = 'number' | 'boolean' | 'string' | 'bigint' | ((v: string) => T);

type EnvconfigOptions<T extends { [k: string]: string | undefined } = any> =
  | {
    env?: T;
    prefix?: string;
    sufix?: string;
  }
  | {
    env?: T;
    optionalPrefix?: string;
    optionalSufix?: string;
  }

interface EnvconfigGetConfigOptions<T extends Types, E extends boolean> {
  required?: E;
  type?: T;
}

type R1<B extends Types> =
  B extends 'string' ? string
  : B extends 'number' ? number
  : B extends 'bigint' ? bigint
  : B extends 'boolean' ? boolean
  : B extends (v: any) => infer R ? R
  : never

type R<T extends Types, E extends boolean> =
  E extends true ? R1<T>
  : E extends false ? R1<T> | undefined
  : never

type Options<T extends Types = 'string', E extends boolean = false> =
  | [(EnvconfigGetConfigOptions<T, E>)?]
  | [T?, E?]

const toNumber = (v: any) => isNumberStr(v)
  ? Number(v)
  : undefined;

const toBigint = (v: any) => isBigIntStr(v)
  ? BigInt(v.slice(0, -1))
  : undefined;

const toBoolean = (v: string) => isBooleanStr(v) ? JSON.parse(v.toLowerCase()) as boolean : undefined;

const transf = <T>(type: Types<T>, v: string | undefined) => {
  if (v === undefined) return undefined;
  else if (typeof type === 'function') return type(v);
  else if (type === 'string') return v;
  else if (type === 'number') return toNumber(v);
  else if (type === 'bigint') return toBigint(v);
  else if (type === 'boolean') return toBoolean(v)
}

const isTypes = <T extends Types>(v: any): v is T => {
  switch (v) {
    case 'string':
    case 'number':
    case 'boolean':
      return true
  }
  if (typeof v === 'function') return true;
  return false
}

const isConfigBool = <E extends boolean>(v: any): v is E => typeof v === 'boolean';
const isConfigObj = <T extends Types, E extends boolean>(v: any): v is EnvconfigGetConfigOptions<T, E> => typeof v === 'object';

const parseOptions = <T extends Types = 'string', E extends boolean = false>(...opts: Options<T, E>) => {
  type A = EnvconfigGetConfigOptions<T, E>

  const resolveOpt = (a: EnvconfigGetConfigOptions<T, E>, v: T | E | A | undefined) => {
    if (isConfigBool<E>(v)) {
      a.required = v
    }
    if (isTypes<T>(v)) {
      a.type = v
    }
    if (isConfigObj<T, E>(v)) {
      return v
    }
    return a
  }

  let out: A = {}

  for (const opt of opts) {
    out = resolveOpt(out, opt)
  }

  return out;
}

export class Envconfig<P extends { [k: string]: string | undefined } = any> {
  constructor(private options?: EnvconfigOptions<P>) { }

  readonly env = this.options?.env ?? process.env;

  findValue(envPath: string) {
    const { optionalPrefix, optionalSufix, prefix, sufix } = this.options as any ?? {}

    const v = this.env;

    const isExacPrefixOrSufix = notIsUndefined(prefix) || notIsUndefined(sufix)
    const isExacPrefixAndSufix = notIsUndefined(prefix) && notIsUndefined(sufix)
    const isOptionalPrefixOrSufix = notIsUndefined(optionalPrefix) || notIsUndefined(optionalSufix)

    const r =
      isExacPrefixOrSufix
        ? isExacPrefixAndSufix ? v[`${prefix}${envPath}${sufix}`] : notIsUndefined(prefix) ? v[`${prefix}${envPath}`] : notIsUndefined(sufix) ? v[`${envPath}${sufix}`] : v[envPath]
        : isOptionalPrefixOrSufix
          ? (notIsUndefined(optionalPrefix) && notIsUndefined(optionalSufix) ? v[`${optionalPrefix}${envPath}${optionalSufix}`] : undefined)
          ?? (notIsUndefined(optionalPrefix) ? v[`${optionalPrefix}${envPath}`] : undefined)
          ?? (notIsUndefined(optionalSufix) ? v[`${envPath}${optionalSufix}`] : undefined)
          ?? v[envPath]
          : v[envPath]

    return r;
  }

  getConfig<T extends Types = 'string', E extends boolean = false>(envPath: string, ...args: Options<T, E>): R<T, E> {
    const options = parseOptions(...args);

    const required = options?.required ?? false;
    const type = options?.type ?? 'string';

    const valueFound = this.findValue(envPath);
    const v = transf(type, valueFound);

    if (required && v === undefined) {
      throw new Error(`Cannot found config ${envPath}`);
    }

    return v;
  }
}

export const envconfig = <T extends { [k: string]: string } = any>(options?: EnvconfigOptions<T>) => {
  const e = new Envconfig<T>(options);
  return e.getConfig.bind(e);
}

export default envconfig;
