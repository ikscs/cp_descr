import { FC, useState } from "react";
import QueryParam, { QueryParamProps } from "../../pages/Reports/QueryParam";
import { ParsedReport } from "../../pages/Reports/ReportList";

// interface ScheduleParamProps extends QueryParamProps {
interface ScheduleParamProps {
  reportId?: number;
}

const ScheduleParam: FC<ScheduleParamProps> = ({ reportId}) => {
    const [selectedReport, setSelectedReport] = useState<ParsedReport>();
    const [queryParams, setQueryParams] = useState<
        { name: string; value: string | number | boolean }[]
    >([]);
    
    const handleExecuteWithParams = () => {
        
    };
    const handleParamDialogClose = () => {
        
    };
    
    if (selectedReport)
    return (
        <QueryParam
            report={selectedReport}
            onExecute={handleExecuteWithParams}
            onClose={handleParamDialogClose}
            initialParams={queryParams}
            // initialShowAsChart={lastShowAsChartPreference}
            // reportContext={reportContextValue} // Pass the transformed customer context
        />
    );
};

export default ScheduleParam;