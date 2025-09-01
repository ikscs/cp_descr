export interface Schedule {
    id: number;
    customer_id: number;
    app_id: string;
    report_id: number;
    report_name?: string;
    maillist: string;
    lang: string;
    cron: string;
    enable: boolean;
    params: Object;
    // params: { name: string; value: string | number | boolean }[];
}

export interface ReportName {
    report_id: number;
    report_name: string;

}
