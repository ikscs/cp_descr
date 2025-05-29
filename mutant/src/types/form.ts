export type FieldType = 'text' | 'number' | 'select' | 'switch' | 'dynamic-select';

export interface BaseFieldConfig {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    defaultValue?: any;
}

export interface TextFieldConfig extends BaseFieldConfig {
    type: 'text';
    multiline?: boolean;
    rows?: number;
}

export interface NumberFieldConfig extends BaseFieldConfig {
    type: 'number';
    min?: number;
    max?: number;
}

export interface SelectFieldConfig extends BaseFieldConfig {
    type: 'select';
    options: { value: string | number; label: string }[];
}

export interface SwitchFieldConfig extends BaseFieldConfig {
    type: 'switch';
}

export interface DynamicSelectFieldConfig extends BaseFieldConfig {
    type: 'dynamic-select';
    loadOptions: (...args: any[]) => Promise<{ value: string | number; label: string }[]>;
    dependsOn?: string;
}

export type FieldConfig =
    | TextFieldConfig
    | NumberFieldConfig
    | SelectFieldConfig
    | SwitchFieldConfig
    | DynamicSelectFieldConfig;

export type LayoutType = 'stack' | 'grid' | 'inline' | 'columns';

export interface LayoutConfig {
    type: LayoutType;
    columns?: number;
    fieldLayouts?: Record<string, {
        colSpan?: number;
        rowSpan?: number;
        width?: string | number;
    }>;
}

export interface FormConfig {
    title: string;
    fields: FieldConfig[];
    layout: LayoutConfig;
}

export type FormStatus = 'draft' | 'published' | 'archived';
export type FormCategory = 'customer' | 'order' | 'product' | 'employee' | 'other';

export interface FormVersion {
    version: number;
    config: FormConfig;
    createdAt: string;
    createdBy: string;
    comment?: string;
}

export interface FormMetadata {
    id: string;
    name: string;
    description: string;
    category: FormCategory;
    tags: string[];
    status: FormStatus;
    currentVersion: number;
    versions: FormVersion[];
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
}

export interface FormData {
    metadata: FormMetadata;
    config: FormConfig;
}

export interface FormSummary {
    id: string;
    name: string;
    description: string;
    category: FormCategory;
    tags: string[];
    status: FormStatus;
    currentVersion: number;
    updatedAt: string;
    updatedBy: string;
} 