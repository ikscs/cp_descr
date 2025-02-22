
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
    descrType?: string,
    descrTypeOptions?: IValueLabel[] | undefined,
    descrState?: number| undefined,
    descrOptions?: string[] | undefined,
    descrDescr?: string | undefined,
}
