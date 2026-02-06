import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsAdult(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isAdult',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: string) {
                    const dob = new Date(value);
                    const today = new Date();

                    if (dob > today) return false;

                    const age = today.getFullYear() - dob.getFullYear();
                    const monthDiff = today.getMonth() - dob.getMonth();
                    const dayDiff = today.getDate() - dob.getDate();

                    if (
                        age < 18 ||
                        (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))
                    ) {
                        return false;
                    }

                    return true;
                },

                defaultMessage() {
                    return "DOB must be valid, smaller than today, and age must be greater than 18";
                }
            }
        });
    };
}
