import { constructVerificationMethod } from '../utils';

describe('UniversalRegistrar utilities tests', () => {
  const testDid = process.env.CLIENT_TEST_IDENTIFIER;

  describe('constructVerificationMethod()', () => {
    it('should properly construct a verification method from given base58 key', () => {
      const verificationMethod = constructVerificationMethod(testDid, {
        verificationMethodId: '#did-root',
        privateKeyMultibase: 'zYAjKoNbau5KiqmHPmSxYCvn66dA1vLmwbt',
      });

      expect(verificationMethod).toEqual({
        id: `${testDid}#did-root`,
        type: 'Ed25519VerificationKey2020',
        controller: testDid,
        privateKeyMultibase: 'zYAjKoNbau5KiqmHPmSxYCvn66dA1vLmwbt',
      });
    });

    it('should properly construct a verification method from given jwk', () => {
      const verificationMethod = constructVerificationMethod(testDid, {
        verificationMethodId: '#did-root',
        privateKeyJwk: {
          kty: 'OKP',
          crv: 'Ed25519',
          d: 'YAjKoNbau5KiqmHPmSxYCvn66dA1vLmwbt',
        },
      });

      expect(verificationMethod).toEqual({
        id: `${testDid}#did-root`,
        type: 'Ed25519VerificationKey2020',
        controller: testDid,
        privateKeyJwk: {
          kty: 'OKP',
          crv: 'Ed25519',
          d: 'YAjKoNbau5KiqmHPmSxYCvn66dA1vLmwbt',
        },
      });
    });

    it('should pass given verification method', () => {
      const verificationMethod = constructVerificationMethod(testDid, {
        verificationMethod: {
          id: `${testDid}#did-root`,
          type: 'Ed25519VerificationKey2020',
          controller: testDid,
          privateKeyJwk: {
            kty: 'OKP',
            crv: 'Ed25519',
            d: 'YAjKoNbau5KiqmHPmSxYCvn66dA1vLmwbt',
          },
        },
      });

      expect(verificationMethod).toEqual({
        id: `${testDid}#did-root`,
        type: 'Ed25519VerificationKey2020',
        controller: testDid,
        privateKeyJwk: {
          kty: 'OKP',
          crv: 'Ed25519',
          d: 'YAjKoNbau5KiqmHPmSxYCvn66dA1vLmwbt',
        },
      });
    });
  });
});
