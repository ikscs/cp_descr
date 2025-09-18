import { useState, useEffect, useMemo, useCallback, useId } from 'react';
import { Button, Typography } from '@mui/material';
import { GenericBaseForm } from './GenericBaseForm';
import { useTranslation } from 'react-i18next';

// Припустимо, що GenericForm та його типи пропсів доступні.
// Вам може знадобитися налаштувати ці імпорти на основі вашого фактичного компонента GenericForm.
// Наприклад, якщо GenericForm експортує свої типи полів та макету:
// import { FieldConfig as GenericFormField, LayoutConfig as GenericFormLayoutProps } from './GenericForm';
// Для цього прикладу ми будемо використовувати загальні типи.
type GenericFormField = Record<string, any>; // Замініть на фактичний тип поля з GenericForm.tsx, якщо можливо
type GenericFormLayoutProps = Record<string, any>; // Замініть на фактичний тип макета з GenericForm.tsx, якщо можливо

// Проста перевірка глибокої рівності. Для продакшену розгляньте надійну бібліотеку, таку як lodash.isequal.
const deepEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    for (const key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }
    return true;
};

interface GenericSimpleFormProps<TData extends Record<string, any>> {
    title: string;
    fields: GenericFormField[];
    onSubmit: (data: TData) => Promise<void> | void; // Фактична логіка збереження
    initialValues: TData;
    layout?: GenericFormLayoutProps;
    editButtonText?: string;
    cancelButtonText?: string;
    savingButtonText?: string;
    saveButtonText?: string; // Текст для кнопки збереження, коли вона активна

    // --- Пропси, необхідні для інтеграції з GenericForm ---
    // Передається в GenericForm, якщо він це підтримує
    onValuesChange?: (values: TData) => void;
    // Фактичний компонент GenericForm, який буде рендеритися
    // Це дозволяє гнучкість, якщо GenericForm імпортується з іншого місця
    FormRenderer: React.ComponentType<any>; // наприклад, typeof GenericForm
    //
    goEditing?: boolean; // начинать редактирование сразу
}

// Допоміжна функція для перевірки, чи FormRenderer ймовірно підтримує проп (базова перевірка)
// Більш надійна перевірка може включати інспектування FormRenderer.propTypes або подібного, якщо доступно
const formRendererSupportsProp = (FormRendererComponent: React.ComponentType<any>, propName: string) =>
    !!(FormRendererComponent as any)?.propTypes?.[propName] || typeof (FormRendererComponent as any)?.[propName] !== 'undefined';


export const GenericSimpleForm = <TData extends Record<string, any>>({
    title,
    fields,
    onSubmit,
    initialValues,
    layout,
    editButtonText = "Редагувати",
    cancelButtonText = "Скасувати",
    savingButtonText = "Збереження...",
    saveButtonText = "Зберегти зміни",
    onValuesChange, // Це буде проп, переданий ДО GenericForm
    FormRenderer,
    goEditing = false, // Додано для початку в режимі редагування
}: GenericSimpleFormProps<TData>) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(goEditing);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formKey, setFormKey] = useState(() => Date.now()); // Для скидання GenericForm
    const formId = useId(); // React 18+ для унікального ID. Потрібен фолбек для < React 18.

    const [currentInternalValues, setCurrentInternalValues] = useState<TData>(initialValues);

    useEffect(() => {
        setCurrentInternalValues(initialValues);
        if (!isEditing) { // Скидати ключ тільки якщо не в режимі активного редагування, щоб уникнути втрати даних при непов'язаних змінах пропсів
            setFormKey(Date.now());
        }
    }, [initialValues]); // Видалено isEditing із залежностей, щоб забезпечити скидання при зовнішній зміні initialValues

    const hasChanges = useMemo(() => {
        if (!isEditing) return false;
        return !deepEqual(currentInternalValues, initialValues);
    }, [currentInternalValues, initialValues, isEditing]);

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

    const internalOnSubmit = useCallback(async (data: TData) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
            setIsEditing(false);
            // Батьківський компонент відповідає за оновлення пропсу initialValues,
            // що потім оновить currentInternalValues через useEffect.
        } catch (error) {
            console.error("Submission error in GenericSimpleForm:", error);
            // Повторно кинути помилку, щоб дозволити батьківському компоненту (наприклад, CustomerDetailsForm) обробити та відобразити повідомлення
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [onSubmit]);

    // Ця функція призначена для передачі в базовий GenericForm
    // як проп, наприклад `onValuesChange`.
    const handleFormValuesChange = useCallback((values: TData) => {
        setCurrentInternalValues(values);
        if (onValuesChange) {
            onValuesChange(values);
        }
    }, [onValuesChange]);

    // const actualSubmitButtonText = isSubmitting ? savingButtonText : saveButtonText;
    const actualSubmitButtonText = isSubmitting ? t('GenericSimpleForm.savingButtonText', { defaultValue: savingButtonText }) : t('GenericSimpleForm.saveButtonText', { defaultValue: saveButtonText });

    const actions = isEditing ? (
        <>
            <Button variant="outlined" onClick={handleCancel} disabled={isSubmitting}>
                {/* {cancelButtonText} */}
                {t('GenericSimpleForm.cancelButtonText', { defaultValue: cancelButtonText })}
            </Button>
            <Button
                type="submit" // Ця кнопка буде відправляти форму
                form={formId}  // Посилання на форму всередині FormRenderer
                variant="contained"
                color="primary"
                disabled={!hasChanges || isSubmitting}
            >
                {actualSubmitButtonText}
            </Button>
        </>
    ) : (
        <Button variant="contained" onClick={handleEdit} color="primary">
            {/* {editButtonText} */}
            {t('GenericSimpleForm.editButtonText', { defaultValue: editButtonText })}
        </Button>
    );

    return (
        <GenericBaseForm
            title={title} // Заголовок тепер обробляється GenericBaseForm
            // title={t('GenericBaseForm.title', { title })}
            actions={actions}
        >
            <FormRenderer
                key={formKey}
                // проп title тут видалено, оскільки GenericBaseForm його обробляє
                fields={fields}
                onSubmit={internalOnSubmit}
                defaultValues={initialValues} // GenericForm використовує це для встановлення свого початкового стану
                layout={layout}
                // --- Керування станом GenericForm на основі логіки GenericSimpleForm ---
                disabled={!isEditing || isSubmitting} // Поля в GenericForm вимкнені, якщо не редагується або не відправляється
                
                // ** ВАЖЛИВА МОДИФІКАЦІЯ ДЛЯ GenericForm **
                // GenericForm повинен приймати та використовувати ці пропси:
                formId={formId} // Передати formId в GenericForm
                hideSubmitButton={true} // Сказати GenericForm приховати свою внутрішню кнопку відправки
                onValuesChange={handleFormValuesChange} // GenericForm повинен викликати це при зміні своїх внутрішніх значень
            />
            {isEditing && !formRendererSupportsProp(FormRenderer, 'onValuesChange') && (
                 <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    {/* * Для коректної роботи блокування кнопки "{saveButtonText}" (коли немає змін), компонент `GenericForm` має підтримувати проп `onValuesChange`. */}
                 </Typography>
            )}
        </GenericBaseForm>
    );
};
