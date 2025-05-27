// интерфейс для группы персонала
export interface Group {
  customer_id: number;
  group_id?: number; // Primary key (serial)
  point_id?: number;
  name: string;
}
