import writeXlsxFile from "write-excel-file"

export interface IGridColumn {
    key: string,
    name: string,
    width?: number | string,
    editable?: boolean,
	filterType?: string,
	filterOptions?: {value: any, label: string}[],
	resizable?: boolean,
    // options?: IValueLabel[],
    // dataSource?: string,
}

export const toExcel = async (cols: IGridColumn[], rows: any, name: string) => {
    console.log('toExcel', rows)

    const exportCols = cols.map((col: any) => {
        return {value: col.name, fontWeight: 'bold'}
    })

    const exportRows = rows.map((row: any) => {
        const exportRow: any[] = []
        cols.map((col: any) => {
            exportRow.push({ value: row[col.key] })
        })
        return exportRow
    })
    exportRows.unshift(exportCols)

    try {
        const xlsxBlob = await writeXlsxFile(exportRows, {
            // schema: columnsDefinition,
            // https://gitlab.com/catamphetamine/write-excel-file#browser
            // when no fileName is given results in blob
            fileName: `${name}.xlsx`, // `temp_data.xlsx`,
        });
        console.log("xlsxBlob", xlsxBlob);
    } catch (error) {
        console.log(error);
    }
}
