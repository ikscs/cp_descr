import { FC, useEffect, useMemo, useState } from "react";
import QueryParam, { QueryParamProps } from "../../pages/Reports/QueryParam";
import { getReports, getReportsLang, type Report } from "../../api/data/reportToolsDrf";
import { ParsedReport, ReportToParsedReport } from "../../pages/Reports/ReportList";
import { useGet } from "../../hooks/useGet";
import { ReportDescriptor } from "../../pages/Reports/QueryEdit";
import { useCustomer } from "../../context/CustomerContext";
// import { MakeParsedReport } from "../../pages/Reports/QueryTest";

// interface ScheduleParamProps extends QueryParamProps {
interface ScheduleParamProps {
  reportId?: number;
  onClose: () => void;
  onSave: (params: { name: string; value: string | number | boolean }[]) => void;
}

const ScheduleParam: FC<ScheduleParamProps> = ({ reportId, onClose, onSave}) => {
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
    
    const handleExecute = (params: { name: string; value: string | number | boolean }[]) => {
        console.log(params)
    };

    const handleAcceptParams = (params: { name: string; value: string | number | boolean }[]) => {
        setQueryParams(params);
        onSave(params);
        onClose();
    };
    
    // const onSaveParams = (_params: ReportDescriptor[]) => {
    //     // setQueryParams(params);
    // };

  const { customerData: rawCustomerData } = useCustomer(); // Renamed to avoid confusion
  const reportContextValue = useMemo(() => {
    if (!rawCustomerData) {
      return undefined;
    }

    const context: { [key: string]: number | null | undefined } = {};

    if (rawCustomerData.customer !== undefined) {
      context.customer = rawCustomerData.customer; // Assign if present; number | undefined is compatible
    }
    if (rawCustomerData.point_id !== undefined) {
      context.point_id = rawCustomerData.point_id; // Assign if present
    }

    return context;
  }, [rawCustomerData]);

    if (selectedReport)
    return (
        <QueryParam
            report={selectedReport}
            onExecute={handleExecute}
            onClose={onClose}
            initialParams={queryParams}
            onSaveParams={handleAcceptParams}
            reportContext={reportContextValue} // Pass the transformed customer context
        />
    );
};

export default ScheduleParam;