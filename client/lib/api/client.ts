import { UniversalResolverError, UniversalRegistrarError } from '../exceptions';

type ApiErrorHandler<TError extends object> = (
  response: TError,
) => UniversalRegistrarError | UniversalResolverError;

interface Options<TError extends object> {
  baseUrl: string;
  urlPrefix?: string;
  errorHandler: ApiErrorHandler<TError>;
}

export class ApiClient<TError extends object> {
  constructor(private readonly apiOptions: Options<TError>) {}

  protected async fetch(url: string, options: RequestInit): Promise<Response> {
    const response = await fetch(
      new URL(`${this.apiOptions.urlPrefix}${url}`, this.apiOptions.baseUrl),
      options,
    );

    if (response.ok) {
      return response;
    }

    const error = await response.json();
    throw this.apiOptions.errorHandler(error);
  }
}
