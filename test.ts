import { Envconfig, envconfig } from "./index.js";
import test from "node:test";
import assert from "node:assert";
import { inspect } from "node:util";


test('Envconfig', async (t) => {
  const test = t.test.bind(t);

  await test('(Typing) using as class', () => {
    const env = {
      A: '1',
      B: 'true',
    }

    const e = new Envconfig({ env });

    const va = e.getConfig('A');
    const vb = e.getConfig('A', { required: true });
    const vc = e.getConfig('A', { required: true, type: Number });
    const vd = e.getConfig('A', { required: true, type: 'number' });
    const ve = e.getConfig('A', { required: true, type: 'boolean' });
    const vf = e.getConfig('A', { required: true, type: () => ''.split(/\,\s*/) });
    const vg = e.getConfig('A', { required: true, type: () => new class E { } });
    const vh = e.getConfig('A', { type: 'number' });
    const vi = e.getConfig('A', { type: 'boolean' });
    const vj = e.getConfig('A', { type: () => '1,2'.split(/\,\s*/) });
    const vk = e.getConfig('A', { type: () => new class E { } });

    assert.strictEqual(va, '1');
    assert.strictEqual(vb, '1');
    assert.strictEqual(vc, 1);
    assert.strictEqual(vd, 1);
    assert.strictEqual(ve, true);
    assert.deepStrictEqual(vf, ['']);
    assert.strictEqual(inspect(vg), 'E {}');
    assert.strictEqual(vh, 1);
    assert.strictEqual(vi, true);
    assert.deepStrictEqual(vj, ['1', '2']);
    assert.strictEqual(inspect(vk), 'E {}');
  });

  await test('(Typing) using as function', { skip: true }, () => {

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

  await test('load config', () => {
    process.env.ABC = "abc";

    const e = envconfig();

    assert.equal(e('ABC'), 'abc');
  });

  await test('expect load env with prefix', () => {
    process.env.DEF = "def";
    process.env.AAA_DEF = "abc";

    const e = envconfig({ prefix: 'AAA_' });

    assert.equal(e('DEF'), 'abc');
  });

  await test('expect load env undefined', () => {
    const e = envconfig();

    assert.equal(e('AAA'), undefined);
  });

  await test('expect load env error', () => {
    const e = envconfig();

    assert.throws(() => {
      e('AAB', { required: true })
    }, /Error: Cannot found config AAB/);
  });

  await test('expect transform result to number', () => {
    process.env.ABA = "1234"

    const e = envconfig();

    assert.equal(e('ABA', { type: 'number', required: true }), 1234);
  });

  await test('expect transform result to number', () => {
    process.env.ABA = "1234.1234223"

    const e = envconfig();

    assert.equal(e('ABA', { type: 'number', required: true }), 1234.1234223);
  });

  await test('expect transform result to number', () => {
    process.env.ABA = "1234n"

    const e = envconfig();

    assert.equal(e('ABA', { type: 'bigint', required: true }), 1234n);
  });

  await test('expect transform result to boolean', () => {
    process.env.ACA = "true"
    process.env.ACB = "false"
    process.env.ACC = "True"
    process.env.ACD = "TRUE"

    const e = envconfig();

    assert.equal(e('ACA', { type: 'boolean', required: true }), true);
    assert.equal(e('ACB', { type: 'boolean', required: true }), false);
    assert.equal(e('ACC', { type: 'boolean', required: true }), true);
    assert.equal(e('ACD', { type: 'boolean', required: true }), true);
  });

  await test('expect custom transform', () => {
    process.env.ADA = '{ "a": "a" }';

    const e = envconfig();

    assert.deepEqual(e('ADA', { type: JSON.parse }), { a: "a" });
  });

  await test('syntax optional', () => {
    const env = { a: '12', b: 'true', c: 'gt12', d: '2020-11-23' }

    const e = envconfig({ env: env });

    assert.equal(e('e'), undefined);
    assert.equal(e('a'), '12');
    assert.equal(e('a', 'number'), 12);
    assert.equal(e('a', 'number'), 12);
  });

  await test('demo', () => {
    const env = {}

    const e = envconfig({ env: env });

    const port = e('PORT', 'number') ?? 3000
  });

  await test('demo2', () => {
    const env = {}

    const e = envconfig({ env: env });

    const port = e('PORT', v => new Date(v))
  });

  await test('options prefix', () => {
    const env = { A_B: 'A_B' }

    const e = envconfig({ env: env, prefix: "A_" });

    assert.equal(e('B'), 'A_B')
    assert.equal(e('C'), undefined)
  })

  await test('options sufix', () => {
    const env = { A_B: 'A_B', C: 'C' }

    const e = envconfig({ env: env, suffix: "_B" });

    assert.equal(e('A'), 'A_B')
    assert.equal(e('C'), undefined)
  })

  await test('options prefix and sufix', () => {
    const env = { A_C_B: 'A_C_B', E: 'E', F_B: 'F_B' }

    const e = envconfig({ env: env, prefix: "A_", suffix: '_B' });

    assert.equal(e('C'), 'A_C_B')
    assert.equal(e('E'), undefined)
    assert.equal(e('F'), undefined)
  })

  await test('options optional prefix', () => {
    const env = { A_B: 'A_B', C: 'C' }

    const e = envconfig({ env: env, optionalPrefix: "A_" });

    assert.equal(e('B'), 'A_B')
    assert.equal(e('C'), 'C')
  })

  await test('options optional sufix', () => {
    const env = { A_B: 'A_B', C: 'C' }

    const e = envconfig({ env: env, optionalSuffix: "_B" });

    assert.equal(e('A'), 'A_B')
    assert.equal(e('C'), 'C')
  })

  await test('options optional prefix and sufix', () => {
    const env = { A_B_C: 'A_B_C', D: 'D', A_E: 'A_E', F_C: 'F_C' }

    const e = envconfig({ env: env, optionalPrefix: 'A_', optionalSuffix: "_C" });

    assert.equal(e('B'), 'A_B_C')
    assert.equal(e('D'), 'D')
    assert.equal(e('E'), 'A_E')
    assert.equal(e('F'), 'F_C')
  })

  await test('conflix prefix and optionalprefix', () => {
    const env = { A_B: 'A_B', C: 'C' }

    // @ts-ignore
    const e = envconfig({ env, prefix: 'A_', optionalPrefix: 'A_' })

    assert.equal(e('B'), 'A_B')
    assert.equal(e('C'), undefined)
  })

  await test('conflix sufix and optionalsufix', () => {
    const env = { A_B: 'A_B', C: 'C' }

    const e = envconfig({ env, suffix: '_B', optionalSuffix: '_B' })

    assert.equal(e('A'), 'A_B')
    assert.equal(e('C'), undefined)
  })
});

