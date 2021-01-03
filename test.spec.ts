import { Envconfig, envconfig } from ".";
import { expect } from 'chai';
import { assert } from "console";

describe('Envconfig', () => {

  it.skip('(Typing) using as class', () => {

    const e = new Envconfig();

    const a = e.getConfig('A')

    const b = e.getConfig('A', { required: true });

    const c = e.getConfig('A', { required: true, type: 'number' });
    const d = e.getConfig('A', { required: true, type: 'boolean' });
    const f = e.getConfig('A', { required: true, type: () => ''.split(/\,\s*/) });
    const g = e.getConfig('A', { required: true, type: () => new class E { } });

    const h = e.getConfig('A', { type: 'number' });
    const i = e.getConfig('A', { type: 'boolean' });
    const j = e.getConfig('A', { type: () => ''.split(/\,\s*/) });
    const k = e.getConfig('A', { type: () => new class E { } });

  });

  it.skip('(Typing) using as function', () => {

    const e = envconfig();

    const a = e('A')

    const b = e('A', { required: true });

    const c = e('A', { required: true, type: 'number' });
    const d = e('A', { required: true, type: 'boolean' });
    const f = e('A', { required: true, type: () => ''.split(/\,\s*/) });
    const g = e('A', { required: true, type: () => new class E { } });

    const h = e('A', { type: 'number' });
    const i = e('A', { type: 'boolean' });
    const j = e('A', { type: () => ''.split(/\,\s*/) });
    const k = e('A', { type: () => new class E { } });

  });

  it('load config', () => {
    process.env.ABC = "abc";

    const e = envconfig();

    expect(e('ABC')).to.be.eq('abc');
  });

  it('expect load env with prefix', () => {
    process.env.DEF = "def";
    process.env.AAA_DEF = "abc";

    const e = envconfig({ prefix: 'AAA_' });

    expect(e('DEF')).to.be.eq('abc');
  });

  it('expect load env undefined', () => {
    const e = envconfig();

    expect(e('AAA')).to.be.undefined;
  });

  it('expect load env error', () => {
    const e = envconfig();

    expect(() => e('AAB', { required: true })).throw();
  });

  it('expect transform result to number', () => {
    process.env.ABA = "1234"

    const e = envconfig();

    expect(e('ABA', { type: 'number', required: true })).to.be.eql(1234);
  });

  it('expect transform result to number', () => {
    process.env.ABA = "1234.1234223"

    const e = envconfig();

    expect(e('ABA', { type: 'number', required: true })).to.be.eql(1234.1234223);
  });

  it('expect transform result to number', () => {
    process.env.ABA = "1234n"

    const e = envconfig();

    expect(e('ABA', { type: 'bigint', required: true })).to.be.eql(1234n);
  });

  it('expect transform result to boolean', () => {
    process.env.ACA = "true"
    process.env.ACB = "false"
    process.env.ACC = "True"
    process.env.ACD = "TRUE"

    const e = envconfig();

    expect(e('ACA', { type: 'boolean', required: true })).to.be.eql(true);
    expect(e('ACB', { type: 'boolean', required: true })).to.be.eql(false);
    expect(e('ACC', { type: 'boolean', required: true })).to.be.eql(true);
    expect(e('ACD', { type: 'boolean', required: true })).to.be.eql(true);
  });

  it('expect custom transform', () => {
    process.env.ADA = '{ "a": "a" }';

    const e = envconfig();

    expect(e('ADA', { type: JSON.parse })).to.deep.equal({ a: "a" });
  });

  it('syntax optional', () => {
    const env = { a: '12', b: 'true', c: 'gt12', d: '2020-11-23' }

    const e = envconfig({ env: env });

    expect(e('e')).to.be.undefined;
    expect(e('a')).to.be.equal('12');
    expect(e('a', 'number')).to.be.equal(12);
    expect(e('a', 'number')).to.be.equal(12);
  });

  it('demo', () => {
    const env = {}

    const e = envconfig({ env: env });

    const port = e('PORT', 'number') ?? 3000
  });

  it('demo2', () => {
    const env = {}

    const e = envconfig({ env: env });

    const port = e('PORT', v => new Date(v))
  });

  it('options prefix', () => {
    const env = { A_B: 'A_B' }

    const e = envconfig({ env: env, prefix: "A_" });

    expect(e('B')).to.be.equal('A_B')
    expect(e('C')).to.be.undefined
  })

  it('options sufix', () => {
    const env = { A_B: 'A_B', C: 'C' }

    const e = envconfig({ env: env, sufix: "_B" });

    expect(e('A')).to.be.equal('A_B')
    expect(e('C')).to.be.undefined
  })

  it('options prefix and sufix', () => {
    const env = { A_C_B: 'A_C_B', E: 'E', F_B: 'F_B' }

    const e = envconfig({ env: env, prefix: "A_", sufix: '_B' });

    expect(e('C')).to.be.equal('A_C_B')
    expect(e('E')).to.be.undefined
    expect(e('F')).to.be.undefined
  })

  it('options optional prefix', () => {
    const env = { A_B: 'A_B', C: 'C' }

    const e = envconfig({ env: env, optionalPrefix: "A_" });

    expect(e('B')).to.be.equal('A_B')
    expect(e('C')).to.be.equal('C')
  })

  it('options optional sufix', () => {
    const env = { A_B: 'A_B', C: 'C' }

    const e = envconfig({ env: env, optionalSufix: "_B" });

    expect(e('A')).to.be.equal('A_B')
    expect(e('C')).to.be.equal('C')
  })

  it('options optional prefix and sufix', () => {
    const env = { A_B_C: 'A_B_C', D: 'D', A_E: 'A_E', F_C: 'F_C' }

    const e = envconfig({ env: env, optionalPrefix: 'A_', optionalSufix: "_C" });

    expect(e('B')).to.be.equal('A_B_C')
    expect(e('D')).to.be.equal('D')
    expect(e('E')).to.be.equal('A_E')
    expect(e('F')).to.be.equal('F_C')
  })

  it('conflix prefix and optionalprefix', () => {
    const env = { A_B: 'A_B', C: 'C' }

    // @ts-ignore
    const e = envconfig({ env, prefix: 'A_', optionalPrefix: 'A_' })

    expect(e('B')).to.be.equal('A_B')
    expect(e('C')).to.be.undefined
  })

  it('conflix sufix and optionalsufix', () => {
    const env = { A_B: 'A_B', C: 'C' }

    // @ts-ignore
    const e = envconfig({ env, sufix: '_B', optionalSufix: '_B' })

    expect(e('A')).to.be.equal('A_B')
    expect(e('C')).to.be.undefined
  })
});

