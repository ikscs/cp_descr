// permanent storage modules

interface IPermStore {
    dest: string,    
    fieldDefs: string[],
    // values: any[]
}

// INSERT INTO public.temp_table ( col1,col2 ) VALUES ( ( 1,2 ),( 1,2 ),( 1,2 ),( 1,2 ) )

const wrap = (arr: any[]) => `( ${arr.map(arr1 => "\'"+arr1+"\'").join(',')} )`

export const makeInsertValues = (values: any[]) => {
    return values.map(arr => wrap(arr)).join(',')
}

export const makeFields = (fieldDefs: string[]) => {
    return fieldDefs.map(v => v.split(' ')[0]).join(',')
}

export const makeCreateScript = (params: IPermStore) => {
    return `CREATE TEMP TABLE ${params.dest} ( ${params.fieldDefs});`
}