export interface Person {
  customer_id: number;
  group_id: number;
  group_name: string;
  person_id: number;
  name: string;
  // photo?: Uint8Array,
  photo?: string; // Assuming photo is a Base64 string
}