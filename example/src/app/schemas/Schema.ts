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