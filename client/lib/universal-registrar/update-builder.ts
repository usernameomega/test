import {
  DidDocumentOperation,
  DIDDocumentUpdates,
  UpdateService,
  UpdateVerificationMethod,
  UpdateVerificationRelationship,
} from './types';

interface Updates {
  adds: {
    service: UpdateService[];
    verificationMethod: UpdateVerificationMethod[];
    verificationRelationship: UpdateVerificationRelationship[];
  };
  removes: {
    service: string[];
    verificationMethod: string[];
    verificationRelationship: string[];
  };
  deactivate: boolean;
}

export class DIDUpdateBuilder {
  private updates: Updates;

  private constructor() {
    this.updates = {
      adds: {
        service: [],
        verificationMethod: [],
        verificationRelationship: [],
      },
      removes: {
        service: [],
        verificationMethod: [],
        verificationRelationship: [],
      },
      deactivate: false,
    };
  }

  addService(service: UpdateService): DIDUpdateBuilder {
    this.updates.adds.service.push(service);
    return this;
  }

  removeService(id: string): DIDUpdateBuilder {
    this.updates.removes.service.push(id);
    return this;
  }

  addVerificationMethod(
    verificationMethod: UpdateVerificationMethod,
  ): DIDUpdateBuilder {
    this.updates.adds.verificationMethod.push(verificationMethod);
    return this;
  }

  removeVerificationMethod(id: string): DIDUpdateBuilder {
    this.updates.removes.verificationMethod.push(id);
    return this;
  }

  addVerificationRelationship(
    relationship: UpdateVerificationRelationship,
  ): DIDUpdateBuilder {
    this.updates.adds.verificationRelationship.push(relationship);
    return this;
  }

  removeVerificationRelationship(id: string): DIDUpdateBuilder {
    this.updates.removes.verificationRelationship.push(id);
    return this;
  }

  deactivate(): DIDUpdateBuilder {
    this.updates.deactivate = true;
    return this;
  }

  build(): DIDDocumentUpdates {
    const documentUpdates: DIDDocumentUpdates['didDocument'] = [];
    const operations: DidDocumentOperation[] = [];

    const addToDidDocument = this.buildAddToDidDocument();

    if (addToDidDocument.has) {
      documentUpdates.push(addToDidDocument.updates);
      operations.push('addToDidDocument');
    }

    const removeFromDidDocument = this.buildRemoveFromDidDocument();

    if (removeFromDidDocument.has) {
      documentUpdates.push(removeFromDidDocument.updates);
      operations.push('removeFromDidDocument');
    }

    if (this.updates.deactivate) {
      operations.push('deactivate');
    }

    return {
      didDocumentOperation: operations,
      didDocument: documentUpdates,
    };
  }

  private buildAddToDidDocument() {
    const toAdd: DIDDocumentUpdates['didDocument'][number] = {};

    const properties = Object.keys(
      this.updates.adds,
    ) as (keyof typeof this.updates.adds)[];

    properties.forEach((property) => {
      const propertyArrayInAdds = this.updates.adds[property];
      if (propertyArrayInAdds.length > 0) {
        toAdd[property] = [...propertyArrayInAdds];
      }
    });

    return {
      updates: toAdd,
      has: Object.keys(toAdd).length > 0,
    };
  }

  private buildRemoveFromDidDocument() {
    const toRemove: DIDDocumentUpdates['didDocument'][number] = {};

    const properties = Object.keys(
      this.updates.removes,
    ) as (keyof typeof this.updates.removes)[];

    properties.forEach((property) => {
      const propertyArrayInRemoves = this.updates.removes[property];
      if (propertyArrayInRemoves.length > 0) {
        toRemove[property] = propertyArrayInRemoves.map((id) => ({ id }));
      }
    });

    return {
      updates: toRemove,
      has: Object.keys(toRemove).length > 0,
    };
  }

  static empty() {
    return new DIDUpdateBuilder();
  }
}
