export interface Properties {
  [key: string]: {
    [key: string]: {
      pattern: string;
      resolverUri: string;
      testIdentifiers: string[];
    };
  };
}
