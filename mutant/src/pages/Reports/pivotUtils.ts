import type { ChartData } from './ReportList';

// Define AggregationType and its labels (can be moved to a separate types file)
export enum AggregationType {
  SUM = 'SUM',
  COUNT = 'COUNT',
  AVERAGE = 'AVERAGE',
  MIN = 'MIN',
  MAX = 'MAX',
  NONE = 'NONE', // Represents no aggregation or showing raw data initially
}

export const aggregationTypeLabels: Record<AggregationType, string> = {
  [AggregationType.NONE]: 'None (Raw Data)',
  [AggregationType.SUM]: 'Sum',
  [AggregationType.COUNT]: 'Count',
  [AggregationType.AVERAGE]: 'Average',
  [AggregationType.MIN]: 'Min',
  [AggregationType.MAX]: 'Max',
};

interface PivotedData {
  rows: any[]; // Can be array of objects after pivoting
  columns: string[];
}

// --- Helper: Generate Pivot Data ---
export const generatePivotData = (
    currentRows: any[][],
    currentOriginalColumns: string[],
    currentXAxisField: string,
    currentYAxisField: string,
    currentValueField: string,
    currentAggregation: AggregationType
): PivotedData => {
    if (
        !currentXAxisField ||
        !currentYAxisField ||
        !currentValueField ||
        currentAggregation === AggregationType.NONE ||
        currentXAxisField === currentYAxisField
    ) {
        // This case should be prevented by checks before calling or throw error
        throw new Error("Недостатньо параметрів для генерації зведених даних.");
    }

    const xAxisIndex = currentOriginalColumns.indexOf(currentXAxisField);
    const yAxisIndex = currentOriginalColumns.indexOf(currentYAxisField);
    const valueIndex = currentOriginalColumns.indexOf(currentValueField);

    if (xAxisIndex === -1 || yAxisIndex === -1 || valueIndex === -1) {
        throw new Error('Обрано невірне поле для зведення.');
    }

    const pivotMap = new Map<any, Map<any, any | { sum: number; count: number }>>();
    const uniqueYValues = new Set<any>();

    currentRows.forEach(row => {
        const xValue = row[xAxisIndex];
        const yValue = row[yAxisIndex];
        const cellValue = row[valueIndex];

        uniqueYValues.add(yValue);

        if (!pivotMap.has(xValue)) {
            pivotMap.set(xValue, new Map());
        }
        const yMap = pivotMap.get(xValue)!;
        const numValue = parseFloat(String(cellValue));

        switch (currentAggregation) {
            case AggregationType.COUNT:
                yMap.set(yValue, (yMap.get(yValue) || 0) + 1);
                break;
            case AggregationType.SUM:
                if (!isNaN(numValue)) yMap.set(yValue, (yMap.get(yValue) || 0) + numValue);
                break;
            case AggregationType.MIN:
                if (!isNaN(numValue)) yMap.set(yValue, Math.min(yMap.get(yValue) ?? Infinity, numValue));
                break;
            case AggregationType.MAX:
                if (!isNaN(numValue)) yMap.set(yValue, Math.max(yMap.get(yValue) ?? -Infinity, numValue));
                break;
            case AggregationType.AVERAGE:
                if (!isNaN(numValue)) {
                    const current = yMap.get(yValue) || { sum: 0, count: 0 };
                    yMap.set(yValue, { sum: current.sum + numValue, count: current.count + 1 });
                }
                break;
            default: break;
        }
    });

    const sortedUniqueYValues = Array.from(uniqueYValues).sort((a, b) => String(a).localeCompare(String(b)));
    const pivotColumnsOutput = [currentXAxisField, ...sortedUniqueYValues.map(String)];
    const pivotRowsOutput: any[] = [];
    const sortedXValues = Array.from(pivotMap.keys()).sort((a, b) => String(a).localeCompare(String(b)));

    sortedXValues.forEach(xValue => {
        const rowObject: any = { [currentXAxisField]: xValue };
        const yMap = pivotMap.get(xValue)!;
        sortedUniqueYValues.forEach(yColValue => {
            const aggregated = yMap.get(yColValue);
            if (currentAggregation === AggregationType.AVERAGE) {
                rowObject[String(yColValue)] = aggregated && aggregated.count > 0 ? parseFloat((aggregated.sum / aggregated.count).toFixed(2)) : null;
            } else {
                rowObject[String(yColValue)] = aggregated !== undefined ? aggregated : null;
            }
        });
        pivotRowsOutput.push(rowObject);
    });
    return { rows: pivotRowsOutput, columns: pivotColumnsOutput };
};

// --- Helper: Prepare Chart Data from Pivoted Data ---
export const prepareChartDataFromPivoted = (
    pivotedData: PivotedData,
    currentXAxisField: string,
    currentAggregation: AggregationType,
    currentValueField: string
): ChartData => {
    const chartXAxisValues = pivotedData.rows.map(row => String(row[currentXAxisField]));
    const chartDatasets = pivotedData.columns
        .filter(colName => colName !== currentXAxisField)
        .map(ySeriesName => ({
            label: String(ySeriesName),
            data: pivotedData.rows.map(row => {
                const val = row[ySeriesName];
                if (val === null || val === undefined) return null;
                const numVal = Number(val);
                return isNaN(numVal) ? null : numVal;
            }),
        }));
    return {
        xAxisValues: chartXAxisValues,
        datasets: chartDatasets,
        yAxisLabel: `${aggregationTypeLabels[currentAggregation]} of ${currentValueField}`
    };
};