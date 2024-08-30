export const didCreateBodyFixture = {
  jobId: null,
  options: {
    network: 'testnet',
  },
  secret: {},
  didDocument: {
    '@context': 'https://www.w3.org/ns/did/v1',
    authentication: [],
    service: [],
  },
};

export const didCreatedStateFixture = {
  jobId: null,
  didState: {
    state: 'finished',
    did: 'did:hedera:mainnet:5zNgYSNqFmpfbNdYGXuxy7JfgFKLFXW3X2BiqykfMjpmXtSf9oXBaVA_0.0.4654957',
    secret: {
      verificationMethod: [
        {
          id: 'did:hedera:mainnet:5zNgYSNqFmpfbNdYGXuxy7JfgFKLFXW3X2BiqykfMjpmXtSf9oXBaVA_0.0.4654957#did-root-key',
          type: 'Ed25519VerificationKey2020',
          controller:
            'did:hedera:mainnet:5zNgYSNqFmpfbNdYGXuxy7JfgFKLFXW3X2BiqykfMjpmXtSf9oXBaVA_0.0.4654957',
          privateKeyMultibase: 'z8ZqHhy44r9uXiowuULCaudVy8N7zuHCqj2veXhLkLUeC',
        },
      ],
    },
    didDocument: {
      '@context': 'https://www.w3.org/ns/did/v1',
      id: 'did:hedera:mainnet:5zNgYSNqFmpfbNdYGXuxy7JfgFKLFXW3X2BiqykfMjpmXtSf9oXBaVA_0.0.4654957',
      verificationMethod: [],
      assertionMethod: [],
      authentication: [],
    },
  },
  didDocumentMetadata: {},
  didRegistrationMetadata: {},
};
