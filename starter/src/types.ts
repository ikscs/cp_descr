
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

export interface IDescrDetail {
    name_ua?: string,
    description_ua?:  string,
    state_ua?: number,
    name_ru?: string,
    description_ru?:  string,
    state_ru?: number,
    name_en?: string,
    description_en?:  string,
    state_en?: number,
}
