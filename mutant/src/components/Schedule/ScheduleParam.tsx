import { FC, useEffect, useState } from "react";
import QueryParam, { QueryParamProps } from "../../pages/Reports/QueryParam";
import { getReports, getReportsLang, type Report } from "../../api/data/reportToolsDrf";
import { ParsedReport, ReportToParsedReport } from "../../pages/Reports/ReportList";
import { useGet } from "../../hooks/useGet";
import { ReportDescriptor } from "../../pages/Reports/QueryEdit";
// import { MakeParsedReport } from "../../pages/Reports/QueryTest";

// interface ScheduleParamProps extends QueryParamProps {
interface ScheduleParamProps {
  reportId?: number;
  onClose: () => void;
}

const ScheduleParam: FC<ScheduleParamProps> = ({ reportId, onClose}) => {
    const [selectedReport, setSelectedReport] = useState<ParsedReport>();
    // TODO: actual query
    const { data: reports } = useGet<Report[]>(
        'https://cnt.theweb.place/api/pcnt/perm_report/?app_id=mutant&lang=uk&report_id=' + reportId, []);

    useEffect(() => {
        if (!reports || !reports.length) return;
        const report = reports[0];
        const reportPatched = {...report, config: (report as any).report_config};
        const parsed = ReportToParsedReport(reportPatched);
        setSelectedReport(parsed);
    }, [reports]);

    useEffect(() => {
        const button = document.getElementById('query-param-execute-button');
        if (button) {
            button.textContent = 'Застосувати';
        }
    }, []); 

    const [queryParams, setQueryParams] = useState<
        { name: string; value: string | number | boolean }[]
    >([]);
    
    const handleAcceptParams = () => {
        
    };
    
    if (selectedReport)
    return (
        <QueryParam
            report={selectedReport}
            onExecute={handleAcceptParams}
            onClose={onClose}
            initialParams={queryParams}
            // initialShowAsChart={lastShowAsChartPreference}
            // reportContext={reportContextValue} // Pass the transformed customer context
        />
    );
};

export default ScheduleParam;