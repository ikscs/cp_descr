import { UiSchema, } from '@rjsf/utils';

const uiSchema: UiSchema = {
    // Optional: Define the order of fields if needed
    // 'ui:order': ['group_id', 'name', '*'],
    group_id: {
      'ui:props': {
        // These props are for MUI TextField if using @rjsf/mui.
        // RJSF core will render standard inputs.
        variant: 'filled',
        margin: 'normal',
        fullWidth: true,
        // RJSF should respect "readOnly": true from the schema,
        // making the field non-editable.
        // If you wanted to explicitly pass disabled to an MUI component:
        // disabled: true,
      },
      // 'ui:readonly': true, // Can also be set here, but schema's readOnly is preferred.
    },
    name: {
      'ui:autofocus': true,
      'ui:props': {
        variant: 'filled',
        margin: 'normal',
        fullWidth: true,
      },
    },
  };

  export default uiSchema;