export type SysParam = {
  id: number;
  name: string;
  group_name: string;
  datatype: string;
  view_order: number;
  eu: string | null;
  display_label: string;
  display_type: string;
  enum_values: string | null;
  description: string;
  value: any;
  enabled: boolean;
};