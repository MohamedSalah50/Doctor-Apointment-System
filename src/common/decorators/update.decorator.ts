import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'check_fileds_exist', async: false })
export class checkIfAnyFieldsAreApplied implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        return Object.keys(args.object).length > 0 && Object.values(args.object).filter((arg) => {
            return arg != undefined;
        }).length > 0
    }

    defaultMessage(ValidationArguments?: ValidationArguments): string {
        return 'all update fields are empty';
    }
}

export function containField(
    validationOptions?: ValidationOptions,
) {
    return function (constructor: Function) {
        registerDecorator({
            target: constructor,
            propertyName: undefined!,
            options: validationOptions,
            constraints: [],
            validator: checkIfAnyFieldsAreApplied,
        });
    };
}
