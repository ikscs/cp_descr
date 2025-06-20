export interface MetricField {
  name: string;
  type: string;
  label: string;
  digits?: number;
}

export interface MetricStatus {
  label: string;
  value: string;
  colour: string;
}

export interface MetricTemplate {
  fields: MetricField[];
  status?: MetricStatus[];
}

export interface MetricValue {
  name: string;
  value: number | string;
}

export interface MetricValues {
  [key: string]: number | string;
}

export interface Metric {
  id: number; 
  group_name: string;
  metric_name: string;
  comment: string;
  template: MetricTemplate;
  sortord: number;
  value: MetricValues;
  collected_at: string;
}
