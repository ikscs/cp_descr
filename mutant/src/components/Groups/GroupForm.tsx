import React, { useMemo } from 'react';
import { RJSFSchema, UiSchema, ValidatorType } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
// It's good practice to use a specific Form component if you're integrating
// with a UI library like Material-UI. For example, from '@rjsf/mui'.
import Form from '@rjsf/mui'; // If using Material-UI theme
// import Form from '@rjsf/core'; // Using the core Form for now

import { Group } from './group.types';
import originalGroupSchema from './group.schema.json';
import originalUiGroupSchema from './group.uischema.ts';
import { Box, Button } from '@mui/material';
// For ui:props like variant to work effectively with MUI components,
// you would typically use a theme from @rjsf/mui, for example:
// import { Theme as MuiTheme } from '@rjsf/mui';
// And pass it to the Form: <Form theme={MuiTheme} ... />

interface PointOption {
  point_id: number;
  name: string;
}

interface GroupFormProps {
  group?: Group; // Group for editing, optional for creating a new one
  onSubmit: (group: Group) => void;
  onCancel?: () => void;
  pointOptions: PointOption[]; // Prop for point dropdown options
}

const GroupForm: React.FC<GroupFormProps> = ({
  group,
  onSubmit,
  onCancel,
  pointOptions = [] // Default to an empty array
}) => {
  const handleSubmit = ({ formData }: { formData?: Group }) => {
    if (!formData) return;
    // Ensure point_id is null if it's an empty string or undefined,
    // to match the schema ["integer", "null"]
    // With the new schema using anyOf, RJSF should provide point_id as number or null.
    const submittedGroup: Group = {
      ...formData,
      // If formData.point_id is undefined (e.g. field not in form), default to null.
      // Otherwise, use the value provided by RJSF (should be number or null).
      point_id: formData.point_id === undefined ? -1 : formData.point_id,
    };
    onSubmit(submittedGroup);
  };

  const { schema, uischema } = useMemo(() => {
    // Deep clone the original schema to avoid modifying it globally
    const schema = JSON.parse(JSON.stringify(originalGroupSchema)) as RJSFSchema;
    const uischema = originalUiGroupSchema as UiSchema;

    if (schema.properties && schema.properties.point_id) {
      const point_id_base = schema.properties.point_id as RJSFSchema;
      if (pointOptions.length > 0) {
        schema.properties.point_id = {
          ...point_id_base,
          "enum": pointOptions.map(opt => opt.point_id),
          // "ui:enumNames": pointOptions.map(opt => opt.name),
        } as any;

        uischema.point_id = {
          ...uischema.point_id,
          "ui:enumNames": pointOptions.map(opt => opt.name),
          // 'ui:props': {
          //     ...uischema.point_id['ui:props'],
          //     "ui:enumNames": pointOptions.map(opt => opt.name),
          // }
        }
      } else {
        // Fallback if no pointOptions are provided:
        // Keep original schema definition (renders as number input) but update title
        schema.properties.point_id = {
          ...point_id_base,
          title: `${point_id_base.title || 'Point'} (No options available)`,
        };
      }
    }
    return {
      schema,
      uischema,
    };
  }, [pointOptions]);

  /*
  // UI Schema for customizing form field appearance and behavior.
  // To align with MD3 style, we use 'filled' variant for text fields
  // and ensure proper spacing. All fields are now visible.
  const uiSchema: UiSchema = {
    // Optional: Define the order of fields if needed
    // 'ui:order': ['group_id', 'name', 'point_id', '*'],
    point_id: {
      // 'ui:widget': 'select', // RJSF infers 'select' from 'anyOf' with 'enum' or 'type: "null"' with title
      'ui:props': {
        variant: 'filled',
        margin: 'normal',
        fullWidth: true,
      },
    },
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
  */

  //       <Form<Group, RJSFSchema, any>
  return (
    <Form
      schema={schema} // Use the dynamically generated schema
      // schema={originalGroupSchema as RJSFSchema}
      uiSchema={uischema}
      // uiSchema={originalUiGroupSchema as UiSchema}
      // uiSchema={uischema}
      formData={group} // Initial data for the form
      validator={validator as ValidatorType<Group, RJSFSchema, any>}
      onSubmit={handleSubmit}
    // If using @rjsf/mui, you would add the theme here:
    // theme={MuiTheme}
    // onError={(errors) => console.log('Form errors:', errors)} // For debugging validation errors
    // Pass children to customize action buttons; RJSF won't render its default submit.
    >
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          Save
        </Button>
      </Box>
    </Form>
  );
};

export default GroupForm;
