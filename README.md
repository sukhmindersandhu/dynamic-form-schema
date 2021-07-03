<p>
<p><p align="center">
  <img src="./.github/dynamic-form-schema-logo.png" width="650" />
</p>

<p align="center">
  Schema based dynamic form build for Angular Reactive forms
</p>

**Which Version to use?**

| Angular version | Formly version         |
| --------------- | ---------------------- |
| Angular >= 9.1   | `@dynamic-form-schema@0.x` |


* Supports modern JavaScript: ES5, ES2019.

## User Guide

Globally install `dynamic-form-schema` using the [npm](https://www.npmjs.com/) package manager:

```sh
$ npm install -g dynamic-form-schema
```

# Dynamic-Form-Schema

Dynamic-form-schema uses Angular reactive forms to create form model when component initilizes. Schema provide defination of form model (The form model is the source of truth for the control). Dynamic-form-schema can create complex form model (Create a nested form group) and all can be defined in a simple schema. Whole for model will be defined in plain json schema.

Example Schema would look like below:

```html
export const schema = {
    "controls": [
        { key: 'title', label: 'Title', value: 'mr.', disabled: false, controlType: 'dropdown', options: [
                { key: 'mr.',  value: 'Mr.'},
                { key: 'miss.',  value: 'Miss.'},
                { key: 'mrs.',   value: 'Mrs.'},
                { key: 'master',   value: 'Master'},
                { key: 'ms.', value: 'Ms.'}
            ],
            order: 1
        },
        { key: 'firstName', label: 'First Name', value:'', disabled: false, controlType: 'input', type: 'text', order: 2 },
        { key: 'middleName', label: 'Middle Name', value:'', disabled: true, controlType: 'input', type: 'text', order: 3 },
        { key: 'gender', label: 'Gender', value:'male', disabled: false, controlType: 'dropdown', options: [
                { key: 'male',  value: 'Male'},
                { key: 'female',  value: 'Female'}
            ], 
            order: 5 
        },
        { key: 'maritalStatus', label: 'Marital Status', value:'', disabled: false, controlType: 'dropdown', options: [
                { key: 'married',   value: 'Married'},
                { key: 'single', value: 'Single'}
            ], 
            order: 6
        },
        { key: 'lastName', label: 'Last Name', value:'', disabled: true, controlType: 'input', type: 'text', order: 4 },
        { key: 'age', label: 'Age', value: 10, disabled: false, controlType: 'mat-slider', order: 7 },
        { key: 'emailGroup', label: 'Email Group:', controlType: 'formgroup', order: 8, controls: [
            { key: 'email', label: 'Email', value:'ww', disabled: false, controlType: 'input', type: 'email', order: 1, groupName: 'emailGroup' },
            { key: 'confirmEmail', label: 'Confirm Email', value: 'ww2', disabled: false, controlType: 'input', type: 'email', order: 2, groupName: 'emailGroup' }
        ]}
      ],
    "defaultValidations": {
        'title': [
            { name: 'required' },
            { name: 'minLength', args: [3] }
        ],
        'firstName': [
            { name: 'required' },
            { name: 'minLength', args: [3] },
            { name: 'maxLength', args: [50] }
        ],
        'age': [
            { name: 'range', args: [1, 80] }
        ],
        'email': [
            { name: 'required' },
            { name: 'maxLength', args: [30] }
        ]
    },
    "conditionalDisabled": {
        "firstName": [
            {
                "id": "firstName-age",
                "condition": "equalTo",
                "value": [""],
                "targetControlNames": [ "middleName", "lastName" ],
                "disabled": true,
                "emptyIt": true
            }
        ],
        "title": [
            {
                "id": "title-maritalStatus",
                "condition": "equalTo",
                "value": ["master", "miss."],
                "targetControlNames": [ "maritalStatus" ],
                "disabled": true,
                "emptyIt": true,
                "disabledValues": [ "single" ]
            }
        ]
    },
    "conditionalOptions": {
        "title": [
            {
                "id": "title-gender-male",
                "condition": "equalTo",
                "value": ["mr.", "master"],
                "targetControlName": "gender",
                "optionValue": "male"
            },
            {
                "id": "title-gender-female",
                "condition": "equalTo",
                "value": ["mrs.", "ms.", "miss."],
                "targetControlName": "gender",
                "optionValue": "female"
            },
            {
                "id": "title-maritalStatus-Married",
                "condition": "equalTo",
                "value": ["mrs."],
                "targetControlName": "maritalStatus",
                "optionValue": "married"
            }
        ]
    },
    "conditionalValidations": {
       "gender": [
            {
                "id": "gender-maritalStatus",
                "condition": "equalTo",
                "value": ["male"],
                "targetControlName": "maritalStatus",
                "validations": [ 
                    {
                        "name": "required"
                    }
                ]
            }
        ],
        "title": [
            {
                "id": "title-maritalStatus",
                "condition": "equalTo",
                "value": ["ms."],
                "targetControlName": "maritalStatus",
                "validations": [
                    {
                        "name": "required"
                    }
                ]
            }
        ]
    }
}
```


This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.12.

## Build

Run `ng build dynamic-form-schema` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

Go to projects/dynamic-form-schema folder `cd projects/dynamic-form-schema` 
run `npm version patch`
After building your library with `ng build dynamic-form-schema`, go to the dist folder `cd dist/dynamic-form-schema` and run `npm publish`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Example:

You can find working example under [example folder](example/README.md)