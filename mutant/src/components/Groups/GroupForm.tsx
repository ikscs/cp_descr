import React, { useMemo } from 'react';
import { RJSFSchema, UiSchema, ValidatorType, } from '@rjsf/utils'; // <-- Правильный импорт
import { FormProps } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import Form from '@rjsf/mui'; // If using Material-UI theme

import { Group } from './group.types';
import originalGroupSchema from './group.schema.json';
import originalUiGroupSchema from './group.uischema.ts';
import { Box, Button, withTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import translateSchema from './translateSchema .ts';
// import { Theme as MuiTheme } from '@rjsf/mui';

// const Form = withTheme(MuiTheme) as React.ComponentType<FormProps<any>>;

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
  const { t } = useTranslation();
  const handleSubmit = ({ formData }: { formData?: Group }) => {
    if (!formData) return;
    const submittedGroup: Group = {
      ...formData,
      point_id: formData.point_id === undefined ? -1 : formData.point_id,
    };
    onSubmit(submittedGroup);
  };

  const { schema, uischema } = useMemo(() => {
    // const schema = JSON.parse(JSON.stringify(originalGroupSchema)) as RJSFSchema;
    const schema = translateSchema(t, originalGroupSchema as RJSFSchema);

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
        }
      } else {
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

  return (
    <Form
      // translator={t}
      schema={schema} // Use the dynamically generated schema
      uiSchema={uischema}
      formData={group} // Initial data for the form
      validator={validator as ValidatorType<Group, RJSFSchema, any>}
      onSubmit={handleSubmit}
    >
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }}>
          {/* Cancel */}
          {t('GroupForm.cancel')}
        </Button>
        <Button type="submit" variant="contained">
          {/* Save */}
          {t('GroupForm.Save')}
        </Button>
      </Box>
    </Form>
  );
};

export default GroupForm;
