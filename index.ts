import { inspect } from "util"

const isRecord = (v: unknown): v is Record<string | symbol | number, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isFunction = (v: unknown): v is ((...args: unknown[]) => unknown) => typeof v === 'function'
const isConstructor = (v: unknown): v is new (...args: unknown[]) => unknown => isFunction(v) && isRecord(v.prototype) && v.prototype.constructor === v
const isString = (v: unknown): v is string => typeof v === 'string'
const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean'
const withProp = <T extends string | symbol | number,>(value: Record<string | symbol | number, unknown>, key: T): value is Record<T, unknown> => key in value


export class TransformTypeError extends SyntaxError { }

type TypesList = | 'string' |
  typeof String |
  'number' |
  typeof Number |
  'boolean' |
  typeof Boolean |
  'bigint' |
  typeof BigInt


export type TransformTypeFunction<T,> = (v: string) => T;
export type TransformTypeConstructor<T,> = { new(...args: any): T }
export type TransformType<T,> = string | TransformTypeConstructor<T> | TransformTypeFunction<T>;

const NumberTransformType = (v: string): number => parseFloat(v)
const BooleanTransformType = (v: string): boolean => /^on|1|true$/i.test(v)
const DateTransformType = (v: string): Date => (console.log(v), new Date(v))
const BigIntTransformType = (v: string): bigint => {
  const exp = /^(\d+)n?$/.exec(v);
  if (!exp) {
    throw new TransformTypeError(`Cannot convert ${v} to a BigInt`)
  }
  const [, num] = exp;
  return BigInt(num);
}


export const types = {
  string: (v: string): string => v,
  number: NumberTransformType,
  boolean: BooleanTransformType,
  bigint: BigIntTransformType,
  date: DateTransformType,
}



type EnvconfigOptions = {
  env?: Record<string | number | symbol, string | undefined>;
  prefix?: string;
  suffix?: string;
  optionalPrefix?: string;
  optionalSuffix?: string;
}

const globalThisProcessEnv = () => {
  const g: any = globalThis;
  // Load process.env from globalThis
  if (isRecord(g) && isRecord(g.process) && isRecord(g.process.env)) return g.process.env as Record<string, string | undefined>;
  // Load Deno.env from globalThis
  if (isRecord(g) && isRecord(g.Deno) && isRecord(g.Deno.env) && isFunction(g.Deno.env.toObject)) {
    const res = g.Deno.env.toObject();
    if (isRecord(res)) return res as Record<string, string | undefined>;
  }
  return {}
}

type GetConfigArgs<T, R extends boolean> = [args1?: TransformType<T> | { type?: TransformType<T>, required?: R }, args2?: R | { required: R }]
type ResultGetConfig<T, R extends boolean> = R extends true ? T : T | undefined

const aliasType: [TypesList, TransformTypeFunction<unknown>][] = [
  ['string', types.string],
  [String, types.string],
  ['number', types.number],
  [Number, types.number],
  ['boolean', types.boolean],
  [Boolean, types.boolean],
  ['bigint', types.bigint],
  [BigInt, types.bigint],
];

const resolveTransformType = (tt: TransformType<unknown>): TransformTypeFunction<unknown> => {
  const aliasTypeFound = aliasType.find(([k]) => k === tt);
  if (aliasTypeFound) {
    const [, t] = aliasTypeFound;
    return t;
  }
  if (isConstructor(tt)) {
    return (v: string) => new tt(v)
  }
  if (!isFunction(tt)) {
    throw new TransformTypeError(`Invalid type ${inspect(tt)}`)
  }
  return tt;
}

export class Envconfig {
  readonly env: Record<string | number | symbol, string | undefined>;

  constructor(private options?: EnvconfigOptions) {
    this.env = this.options?.env ?? globalThisProcessEnv()
  }

  *findValue(envPath: string): Generator<[string, string | undefined]> {
    const { optionalPrefix, optionalSuffix, prefix, suffix } = this.options ?? {}

    const principalKey = `${prefix ?? ''}${envPath}${suffix ?? ''}`;
    let keys: string[] = [principalKey];

    if (!prefix && optionalPrefix) {
      keys = [`${optionalPrefix}${principalKey}`, ...keys];
    }

    if (!suffix && optionalSuffix) {
      keys = [`${principalKey}${optionalSuffix}`, ...keys];
    }

    if (!prefix && optionalPrefix && !suffix && optionalSuffix) {
      keys = [`${optionalPrefix}${principalKey}${optionalSuffix}`, ...keys];
    }

    for (const key of keys) {
      yield [key, this.env[key]];
    }
  }

  getConfig<R extends boolean = false>(configPath: string, ...args: GetConfigArgs<'string', R>): ResultGetConfig<string, R>
  getConfig<R extends boolean = false>(configPath: string, ...args: GetConfigArgs<'bigint', R>): ResultGetConfig<bigint, R>
  getConfig<R extends boolean = false>(configPath: string, ...args: GetConfigArgs<'number', R>): ResultGetConfig<number, R>
  getConfig<R extends boolean = false>(configPath: string, ...args: GetConfigArgs<'boolean', R>): ResultGetConfig<boolean, R>
  getConfig<T, R extends boolean = false>(configPath: string, ...args: GetConfigArgs<T, R>): ResultGetConfig<T, R>
  getConfig<R extends boolean = false>(configPath: string, ...args: GetConfigArgs<unknown, R>): ResultGetConfig<unknown, R> {
    const [arg1, arg2] = args;
    let required: boolean = false;
    let transformType: TransformType<any> = function defaultTransformType(v: any) { return v };

    try {
      if (isFunction(arg1)) {
        transformType = resolveTransformType(arg1);
        if (isRecord(arg2)) {
          required = arg2.required;
        }
        if (isBoolean(arg2)) {
          required = arg2;
        }
      } else if (isRecord(arg1)) {
        if (arg1.type !== undefined) {
          transformType = resolveTransformType(arg1.type);
        }
        if (isBoolean(arg1.required)) {
          required = arg1.required;
        } else if (isBoolean(arg2)) {
          required = arg2;
        } else if (isRecord(arg2)) {
          required = arg2.required;
        }
      }

      for (const [_key, value] of this.findValue(configPath)) {
        if (value !== undefined) {
          return transformType(value);
        }
      }

      if (required) {
        throw new TransformTypeError(`Cannot found config ${configPath}`)
      }
    } catch (ex) {
      if (ex instanceof TransformTypeError) {
        Error.captureStackTrace(ex, Envconfig.prototype.getConfig);
        throw ex;
      }
      throw ex;
    }

    return undefined as any;
  }
}

export const envconfig = (options?: EnvconfigOptions) => {
  const e = new Envconfig(options);
  return e.getConfig.bind(e);
}

export default envconfig;
