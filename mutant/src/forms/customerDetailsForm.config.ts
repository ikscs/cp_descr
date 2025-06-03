import { FormConfig } from '../types/form';

export const customerDetailsFormConfig: FormConfig = {
    title: 'Customer Details',
    fields: [
        {
            name: 'firstName',
            label: 'First Name',
            type: 'text',
            required: true
        },
        {
            name: 'lastName',
            label: 'Last Name',
            type: 'text',
            required: true
        },
        {
            name: 'email',
            label: 'Email',
            type: 'text',
            required: true
        },
        {
            name: 'phone',
            label: 'Phone Number',
            type: 'text',
            required: false
        },
        {
            name: 'customerType',
            label: 'Customer Type',
            type: 'select',
            required: true,
            options: [
                { value: 'individual', label: 'Individual' },
                { value: 'business', label: 'Business' },
                { value: 'government', label: 'Government' }
            ]
        },
        {
            name: 'isActive',
            label: 'Active Customer',
            type: 'switch',
            defaultValue: true
        },
        {
            name: 'notes',
            label: 'Additional Notes',
            type: 'text',
            multiline: true,
            rows: 4
        }
    ],
    layout: {
        type: 'grid',
        columns: 2,
        fieldLayouts: {
            notes: {
                colSpan: 2
            }
        }
    }
}; 