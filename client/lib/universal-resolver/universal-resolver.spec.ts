import { UniversalResolver } from './universal-resolver';

describe('UniversalResolver Client tests', () => {
  const testDid = process.env.CLIENT_TEST_IDENTIFIER;
  let resolver: UniversalResolver;
  let fetchMock: jest.SpyInstance;

  beforeAll(() => {
    const options = {
      identityServiceUrl: process.env.CLIENT_TEST_IS_URL,
    };

    resolver = new UniversalResolver(options);
    fetchMock = jest.spyOn(resolver, 'fetch' as any);
  });

  beforeEach(() => {
    fetchMock.mockClear();
    fetchMock.mockReset();
  });

  it('should resolve a did document', async () => {
    jest.spyOn(resolver, 'fetch' as any).mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          '@context': 'https://www.w3.org/ns/did/v1',
          id: testDid,
        }),
    });

    const didDocument = await resolver.resolve(testDid, {
      accept: 'application/ld+json;profile="https://w3id.org/did-resolution"',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(`identifiers/${testDid}`, {
      method: 'GET',
      headers: {
        Accept: 'application/ld+json;profile="https://w3id.org/did-resolution"',
      },
    });

    expect(didDocument).toEqual({
      '@context': 'https://www.w3.org/ns/did/v1',
      id: testDid,
    });
  });

  it('should resolve a service endpoint', async () => {
    fetchMock.mockResolvedValueOnce({
      text: () =>
        Promise.resolve('https://github.com/Swiss-Digital-Assets-Institute'),
    });

    const serviceEndpoint = await resolver.resolveServiceEndpoint(
      testDid,
      'service-1',
      'Swiss-Digital-Assets-Institute',
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `identifiers/${testDid}?service=service-1&relativeRef=Swiss-Digital-Assets-Institute`,
      {
        method: 'GET',
        headers: { Accept: 'application/did+ld+json' },
      },
    );

    expect(serviceEndpoint).toBeDefined();
    expect(serviceEndpoint).toBe(
      'https://github.com/Swiss-Digital-Assets-Institute',
    );
  });

  it('should resolve a fragment', async () => {
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          id: '#service-1',
          type: 'Service',
          serviceEndpoint: '',
        }),
    });

    const serviceEndpoint = await resolver.resolveDocumentFragment(
      testDid,
      'service-1',
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `identifiers/${testDid}%23service-1`,
      {
        method: 'GET',
        headers: { Accept: 'application/did+ld+json' },
      },
    );

    expect(serviceEndpoint).toEqual({
      id: '#service-1',
      type: 'Service',
      serviceEndpoint: '',
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

    const properties = await resolver.properties();

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

    const methods = await resolver.methods();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('methods', {
      method: 'GET',
      headers: { Accept: 'application/did+json' },
    });

    expect(methods).toStrictEqual(['hedera']);
  });

  it('should return test identifiers', async () => {
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          hedera: ['did:hedera:testnet:0x123456789'],
        }),
    });

    const testIdentifiers = await resolver.testIdentifiers();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('testIdentifiers', {
      method: 'GET',
      headers: { Accept: 'application/did+json' },
    });

    expect(testIdentifiers).toEqual({
      hedera: ['did:hedera:testnet:0x123456789'],
    });
  });
});
