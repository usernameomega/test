export const didUpdateBodyFixture = {
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
  options: {
    network: 'testnet',
  },
  didDocumentOperation: [],
  didDocument: [],
};

export const didUpdatedStateFixture = {
  jobId: '6d85bcd0-2ea3-4288-ab00-15afadd8a156',
  didState: {
    state: 'finished',
    did: 'did:hedera:mainnet:5zNgYSNqFmpfbNdYGXuxy7JfgFKLFXW3X2BiqykfMjpmXtSf9oXBaVA_0.0.4654957',
    secret: {},
    didDocument: {
      '@context': 'https://www.w3.org/ns/did/v1',
      id: 'did:hedera:mainnet:5zNgYSNqFmpfbNdYGXuxy7JfgFKLFXW3X2BiqykfMjpmXtSf9oXBaVA_0.0.4654957',
      verificationMethod: [
        {
          id: 'did:hedera:mainnet:5zNgYSNqFmpfbNdYGXuxy7JfgFKLFXW3X2BiqykfMjpmXtSf9oXBaVA_0.0.4654957#did-root-key',
          type: 'Ed25519VerificationKey2018',
          controller:
            'did:hedera:mainnet:5zNgYSNqFmpfbNdYGXuxy7JfgFKLFXW3X2BiqykfMjpmXtSf9oXBaVA_0.0.4654957',
          publicKeyBase58: '5VXK3TRNZXR7FJxRtSnXNk3gWmHsdHtSVBULVQPF9ws6',
        },
      ],
      assertionMethod: [
        'did:hedera:mainnet:5zNgYSNqFmpfbNdYGXuxy7JfgFKLFXW3X2BiqykfMjpmXtSf9oXBaVA_0.0.4654957#did-root-key',
      ],
      authentication: [
        'did:hedera:mainnet:5zNgYSNqFmpfbNdYGXuxy7JfgFKLFXW3X2BiqykfMjpmXtSf9oXBaVA_0.0.4654957#did-root-key',
      ],
      service: [],
    },
  },
  didDocumentMetadata: {},
  didRegistrationMetadata: {},
};
