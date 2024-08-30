import * as basics from 'multiformats/basics';
import { RegistrarBadRequestException } from '../exceptions/registrar-bad-request.exception';
import { Injectable } from '@nestjs/common';

type MultibaseAlgorithm =
  | 'base16'
  | 'base16upper'
  | 'base32'
  | 'base32upper'
  | 'base58btc'
  | 'base64'
  | 'base64url'
  | 'base64urlpad';

type Identifier = 'f' | 'F' | 'b' | 'B' | 'z' | 'm' | 'u' | 'U';

@Injectable()
export class MultibaseCodec {
  private algorithmMap: Record<Identifier, MultibaseAlgorithm> = {
    f: 'base16',
    F: 'base16upper',
    b: 'base32',
    B: 'base32upper',
    z: 'base58btc',
    m: 'base64',
    u: 'base64url',
    U: 'base64urlpad',
  };

  decode(data: string): Uint8Array {
    const identifier = data[0] as Identifier;
    const algorithm = this.algorithmMap[identifier];
    const decoder = basics.bases[algorithm].decoder;

    if (!decoder) {
      throw new RegistrarBadRequestException();
    }

    return decoder.decode(data);
  }

  encode(
    data: Uint8Array,
    algorithm: MultibaseAlgorithm = 'base58btc',
  ): string {
    const encoder = basics.bases[algorithm].encoder;

    if (!encoder) {
      throw new RegistrarBadRequestException();
    }

    return `${encoder.encode(data)}`;
  }
}
