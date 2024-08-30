import { UniversalRegistrar } from '../universal-registrar';
import { DIDUpdateBuilder } from '../update-builder';

describe('UniversalRegistrar Client tests', () => {
  const testDid = process.env.CLIENT_TEST_IDENTIFIER;
  let registrar: UniversalRegistrar;
  let fetchMock: jest.SpyInstance;

  beforeAll(() => {
    const options = {
      identityServiceUrl: process.env.CLIENT_TEST_IS_URL,
    };

    registrar = new UniversalRegistrar(options);
    fetchMock = jest.spyOn(registrar, 'fetch' as any);
  });

  beforeEach(() => {
    fetchMock.mockClear();
    fetchMock.mockReset();
  });

  it('should create a did document', async () => {
    jest.spyOn(registrar, 'fetch' as any).mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          didState: {
            didDocument: {
              '@context': 'https://www.w3.org/ns/did/v1',
              id: testDid,
            },
            secret: {
              verificationMethod: [
                {
                  privateKeyMultibase: 'zYAjKoNbau5KiqmHPmSxYCvn66dA1vLmwbt',
                },
              ],
            },
          },
        }),
    });

    const creationResult = await registrar.create({
      method: 'hedera',
      network: 'testnet',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(`create?method=hedera`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: expect.any(String),
    });

    expect(creationResult.didDocument).toEqual({
      '@context': 'https://www.w3.org/ns/did/v1',
      id: testDid,
    });
    expect(creationResult.privateKeyMultibase).toEqual(
      'zYAjKoNbau5KiqmHPmSxYCvn66dA1vLmwbt',
    );
  });

  it('should update a did document', async () => {
    jest.spyOn(registrar, 'fetch' as any).mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          didState: {
            didDocument: {
              '@context': 'https://www.w3.org/ns/did/v1',
              id: testDid,
            },
          },
        }),
    });

    const creationResult = await registrar.update({
      did: testDid,
      secret: {
        verificationMethodId: '#did-root-key',
        privateKeyMultibase: 'zYAjKoNbau5KiqmHPmSxYCvn66dA1vLmwbt',
      },
      network: 'testnet',
      updates: DIDUpdateBuilder.empty()
        .addService({
          serviceEndpoint: 'http://example.com',
          id: 'LinkedDomains',
          type: '#LinkedDomains',
        })
        .build(),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(`update`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: expect.any(String),
    });

    expect(creationResult.didDocument).toEqual({
      '@context': 'https://www.w3.org/ns/did/v1',
      id: testDid,
    });
  });

  it('should deactivate a did document', async () => {
    jest.spyOn(registrar, 'fetch' as any).mockResolvedValueOnce(void 0);

    await registrar.deactivate({
      did: testDid,
      secret: {
        verificationMethodId: '#did-root-key',
        privateKeyMultibase: 'zYAjKoNbau5KiqmHPmSxYCvn66dA1vLmwbt',
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(`deactivate`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: expect.any(String),
    });
  });

  it('should return properties', async () => {
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          'driver-0': {
            http: {
              pattern: expect.any(String),
              resolverUri: expect.any(String),
              testIdentifiers: expect.anything(),
            },
          },
        }),
    });

    const properties = await registrar.properties();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('properties', {
      method: 'GET',
      headers: { Accept: 'application/did+json' },
    });

    expect(properties).toMatchObject({
      'driver-0': {
        http: {
          pattern: expect.any(String),
          resolverUri: expect.any(String),
          testIdentifiers: expect.anything(),
        },
      },
    });
  });

  it('should return methods', async () => {
    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve(['hedera']),
    });

    const methods = await registrar.methods();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('methods', {
      method: 'GET',
      headers: { Accept: 'application/did+json' },
    });

    expect(methods).toStrictEqual(['hedera']);
  });
});
