import { DIDUpdateBuilder } from '../update-builder';

describe('UniversalRegistrar did update builder tests', () => {
  const testDid = process.env.CLIENT_TEST_IDENTIFIER;

  it('build an empty update state', async () => {
    const updateBuilder = DIDUpdateBuilder.empty();

    const updateState = updateBuilder.build();

    expect(updateState).toEqual({
      didDocumentOperation: [],
      didDocument: [],
    });
  });

  it('should deactivate a did document', async () => {
    const updateBuilder = DIDUpdateBuilder.empty().deactivate();

    const updateState = updateBuilder.build();

    expect(updateState).toEqual({
      didDocumentOperation: ['deactivate'],
      didDocument: [],
    });
  });

  it('should add two verification method, a service and relationship', async () => {
    const updateBuilder = DIDUpdateBuilder.empty()
      .addService({
        id: `${testDid}#service-1`,
        type: 'VC',
        serviceEndpoint: 'file://example',
      })
      .addVerificationMethod({
        id: `${testDid}#key-1`,
        type: 'Ed25519VerificationKey2018',
        controller: testDid,
        publicKeyMultibase: 'z6MYLu1fhuwEVkk7bhZPmpa52HJ1U24GqFAw5brNp4ryH',
      })
      .addVerificationMethod({
        id: `${testDid}#key-2`,
        type: 'Ed25519VerificationKey2020',
        controller: testDid,
        publicKeyMultibase: 'z9gu76g98gd79Gdg9ogg697Gdkk7bhZPmpa52HJ1U2',
      })
      .addVerificationRelationship({
        id: `${testDid}#key-1`,
        verificationMethod: `${testDid}#key-1`,
      });

    const updateState = updateBuilder.build();

    expect(updateState).toEqual({
      didDocumentOperation: ['addToDidDocument'],
      didDocument: [
        {
          verificationMethod: [
            {
              id: `${testDid}#key-1`,
              type: 'Ed25519VerificationKey2018',
              controller: testDid,
              publicKeyMultibase:
                'z6MYLu1fhuwEVkk7bhZPmpa52HJ1U24GqFAw5brNp4ryH',
            },
            {
              id: `${testDid}#key-2`,
              type: 'Ed25519VerificationKey2020',
              controller: testDid,
              publicKeyMultibase: 'z9gu76g98gd79Gdg9ogg697Gdkk7bhZPmpa52HJ1U2',
            },
          ],
          service: [
            {
              id: `${testDid}#service-1`,
              type: 'VC',
              serviceEndpoint: 'file://example',
            },
          ],
          verificationRelationship: [
            {
              id: `${testDid}#key-1`,
              verificationMethod: `${testDid}#key-1`,
            },
          ],
        },
      ],
    });
  });

  it('should delete two verification method, a service and relationship', async () => {
    const updateBuilder = DIDUpdateBuilder.empty()
      .removeService(`${testDid}#service-1`)
      .removeVerificationMethod(`${testDid}#key-1`)
      .removeVerificationMethod(`${testDid}#key-2`)
      .removeVerificationRelationship(`${testDid}#key-1`);

    const updateState = updateBuilder.build();

    expect(updateState).toEqual({
      didDocumentOperation: ['removeFromDidDocument'],
      didDocument: [
        {
          verificationMethod: [
            {
              id: `${testDid}#key-1`,
            },
            {
              id: `${testDid}#key-2`,
            },
          ],
          service: [
            {
              id: `${testDid}#service-1`,
            },
          ],
          verificationRelationship: [
            {
              id: `${testDid}#key-1`,
            },
          ],
        },
      ],
    });
  });

  it('should add a verification method and service along with other verification method removal', async () => {
    const updateBuilder = DIDUpdateBuilder.empty()
      .addVerificationMethod({
        id: `${testDid}#key-1`,
        type: 'Ed25519VerificationKey2018',
        controller: testDid,
        publicKeyMultibase: 'z6MYLu1fhuwEVkk7bhZPmpa52HJ1U24GqFAw5brNp4ryH',
      })
      .addService({
        id: `${testDid}#service-1`,
        type: 'LinkedDomains',
        serviceEndpoint: 'http://www.example.com',
      })
      .removeVerificationMethod(`${testDid}#key-2`);

    const updateState = updateBuilder.build();

    expect(updateState).toEqual({
      didDocumentOperation: ['addToDidDocument', 'removeFromDidDocument'],
      didDocument: [
        {
          verificationMethod: [
            {
              id: `${testDid}#key-1`,
              type: 'Ed25519VerificationKey2018',
              controller: testDid,
              publicKeyMultibase:
                'z6MYLu1fhuwEVkk7bhZPmpa52HJ1U24GqFAw5brNp4ryH',
            },
          ],
          service: [
            {
              id: `${testDid}#service-1`,
              type: 'LinkedDomains',
              serviceEndpoint: 'http://www.example.com',
            },
          ],
        },
        {
          verificationMethod: [
            {
              id: `${testDid}#key-2`,
            },
          ],
        },
      ],
    });
  });
});
