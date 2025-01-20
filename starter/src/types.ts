
export interface IValueLabel {
    value: Object,
    label: string,
}

export interface ILang {
    ua?: boolean,
    en?: boolean,
    ru?: boolean,
}

export interface IDescrFilter {
    descrType?: string | undefined,
    descrTypeOptions?: IValueLabel[] | undefined,
    descrState?: number| undefined,
    descrOptions?: string[] | undefined,
}
