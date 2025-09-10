export interface DbSchedule {
  id: number;
  customer_id: number;
  app_id: string;
  report_id: number;
  report_name?: string;
  maillist: string;
  lang: string;
  cron: string;
  enable: boolean;
  params: Object; // сырые данные
  comment: string | null;
}

export interface Schedule extends Omit<DbSchedule, "params"> {
  params: ParamValue[];
}

export interface ReportName {
    report_id: number;
    report_name: string;
    report_config: string;
    // report_config: {params: ParamValue[]};
}

export interface ParamValue {
    name: string;
    value: string | number | boolean;
}
