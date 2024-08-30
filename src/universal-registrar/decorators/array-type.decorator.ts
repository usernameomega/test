import { plainToInstance } from 'class-transformer';
import {
  registerDecorator,
  validateSync,
  ValidationArguments,
} from 'class-validator';
import { RegistrarBadRequestException } from '../exceptions/registrar-bad-request.exception';

type PropertyClassValidator = Record<string, new () => any>;

export function ClassArrayType(types: PropertyClassValidator) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'classArrayType',
      target: object.constructor,
      propertyName,
      constraints: [types],
      options: { each: true },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const types = args.constraints[0] as PropertyClassValidator;
          let errorsAmount = 0;

          Object.entries(value).forEach(
            ([key, element]: [string, object[]]) => {
              const ValidationClass = types[key];

              if (!ValidationClass) {
                return ++errorsAmount;
              }

              element.forEach((el: any) => {
                const instance = plainToInstance(ValidationClass, {
                  [key]: [el],
                });

                const errors = validateSync(instance);
                errorsAmount += errors.length;
              });
            },
          );

          if (errorsAmount > 0) {
            Promise.reject(new RegistrarBadRequestException());
          }

          return true;
        },
      },
    });
  };
}
