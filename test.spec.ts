import { Envconfig, envconfig } from ".";
import { expect } from 'chai';

describe('Envconfig', () => {

    it.skip('using as class', () => {

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

    it.skip('using as function', () => {

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

        expect(e('ABA', { type: 'number', required: true })).to.be.eql(1234n);
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

});

