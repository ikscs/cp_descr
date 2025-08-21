import { useState, useEffect, useMemo, useCallback, useId } from 'react';
import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useForm, Controller, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// import { set } from 'date-fns/esm';

type GenericFormField = Record<string, any>; // Замініть на фактичний тип поля з GenericForm.tsx, якщо можливо
type GenericFormLayoutProps = Record<string, any>; // Замініть на фактичний тип макета з GenericForm.tsx, якщо можливо

interface GenericFormProps<TData extends Record<string, any>> {
    title: string;
    fields: GenericFormField[];
    onSubmit: (data: any) => void;
    initialValues: TData;
    layout?: GenericFormLayoutProps;
    editButtonText?: string;
    cancelButtonText?: string;
    savingButtonText?: string;
    saveButtonText?: string;

    // --- Пропси, необхідні для інтеграції з GenericForm ---
    // Передається в GenericForm, якщо він це підтримує
    onValuesChange?: (values: TData) => void;

    FormRenderer: React.ComponentType<any>;
    goEditing?: boolean; // начинать редактирование сразу
}

export const GenericForm = <TData extends Record<string, any>>({
    title,
    fields,
    onSubmit,
    initialValues,
    layout,
    editButtonText = "Редагувати",
    cancelButtonText = "Скасувати",
    savingButtonText = "Збереження...",
    saveButtonText = "Зберегти зміни",
    FormRenderer,
    goEditing = false, // Додано для початку в режимі редагування
}: GenericFormProps<TData>) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(goEditing);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formKey, setFormKey] = useState(() => Date.now()); // Для скидання GenericForm
    const formId = useId(); // React 18+ для унікального ID. Потрібен фолбек для < React 18.

    const [_currentInternalValues, setCurrentInternalValues] = useState<TData>(initialValues);

    useEffect(() => {
        setCurrentInternalValues(initialValues);
        if (!isEditing) { // Скидати ключ тільки якщо не в режимі активного редагування, щоб уникнути втрати даних при непов'язаних змінах пропсів
            setFormKey(Date.now());
        }
    }, [initialValues]); 

    const handleEdit = useCallback(() => {
        setIsEditing(true);
        // При вході в режим редагування переконайтеся, що поточні значення відображають початкові значення
        // для правильного розрахунку 'hasChanges', доки користувач не зробить редагування.
        setCurrentInternalValues(initialValues);
    }, [initialValues]);

    const handleCancel = useCallback(() => {
        setIsEditing(false);
        setCurrentInternalValues(initialValues);
        setFormKey(Date.now()); // Примусово переініціалізувати GenericForm
    }, [initialValues]);

    const actualSubmitButtonText = isSubmitting ? t('GenericSimpleForm.savingButtonText', { defaultValue: savingButtonText }) : t('GenericSimpleForm.saveButtonText', { defaultValue: saveButtonText });

    const actions = isEditing ? (
        <>
            <Button variant="outlined" onClick={handleCancel} disabled={isSubmitting}>
                {t('GenericSimpleForm.cancelButtonText', { defaultValue: cancelButtonText })}
            </Button>
            <Button
                type="submit"
                form={formId}
                variant="contained"
                color="primary"
                // disabled={!hasChanges || isSubmitting}
                disabled={!isEditing || isSubmitting}
            >
                {actualSubmitButtonText}
            </Button>
        </>
    ) : (
        <Button variant="contained" onClick={handleEdit} color="primary">
            {t('GenericSimpleForm.editButtonText', { defaultValue: editButtonText })}
        </Button>
    );

    const schema = z.object(
        fields.reduce((acc, field) => {
            let fieldSchema;

            switch (field.type) {
                case 'text':
                    fieldSchema = field.required
                        ? z.string().min(1, { message: "Це поле обов'язкове" })
                        : z.string().optional();
                    break;
                case 'number':
                    fieldSchema = z.number();
                    if (field.min !== undefined) {
                        fieldSchema = fieldSchema.min(field.min);
                    }
                    if (field.max !== undefined) {
                        fieldSchema = fieldSchema.max(field.max);
                    }
                    if (field.required) {
                        fieldSchema = fieldSchema.nullable().refine((val: any) => val !== null, {
                            message: "Це поле обов'язкове"
                        });
                    } else {
                        fieldSchema = fieldSchema.optional();
                    }
                    break;
                case 'select':
                case 'dynamic-select':
                    fieldSchema = field.required
                        ? z.union([z.string(), z.number()]).refine((val: any) => val !== '', {
                            message: "Це поле обов'язкове"
                        })
                        : z.union([z.string(), z.number()]).optional();
                    break;
                case 'switch':
                    fieldSchema = z.boolean();
                    break;
                default:
                    fieldSchema = z.any();
            }

            return { ...acc, [field.name]: fieldSchema };
        }, {} as Record<string, z.ZodType>)
    );

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitSuccessful },
        reset,
    } = useForm<FieldValues>({
        resolver: zodResolver(schema),
        defaultValues: initialValues,
    });

    useEffect(() => {
        if (isSubmitSuccessful) {
            console.log("✅ Submit прошёл успешно!");
            setIsEditing(false);
            // сбросить state of Submit
            reset(undefined, { keepValues: true });        }
    }, [isSubmitSuccessful]);

    return (
        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <FormRenderer
                title={title}
                key={formKey}
                fields={fields}
                defaultValues={initialValues} 
                layout={layout}
                disabled={!isEditing || isSubmitting}
                control={control}
                errors={errors}
                watch={watch}
            />

            {actions}

        </form>
    );
};
