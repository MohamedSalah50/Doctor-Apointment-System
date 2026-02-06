import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';



@ValidatorConstraint({ name: 'check_matching_password', async: false })
export class IsMatchedMethod<T = any> implements ValidatorConstraintInterface {
    validate(value: T, args: ValidationArguments) {
        // console.log({
        //   value,
        //   args,
        //   con: args.constraints[0],
        //   cV: args.object[args.constraints[0]],
        // });
        return value === args.object[args.constraints[0]];
    }

    defaultMessage(ValidationArguments?: ValidationArguments): string {
        return 'not matched fields';
    }
}

export function IsMatched<T = any>(
    constraints: string[],
    validationOptions?: ValidationOptions,
) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints,
            validator: IsMatchedMethod<T>,
        });
    };
}