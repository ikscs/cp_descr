
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

// export interface IDescrDetail {
//     name_ua: string,
//     state_n_ua: number,
//     description_ua:  string,
//     state_d_ua: number,
//     name_ru: string,
//     state_n_ru: number,
//     description_ru:  string,
//     state_d_ru: number,
//     name_en: string,
//     state_n_en: number,
//     description_en:  string,
//     state_d_en: number,
// }
