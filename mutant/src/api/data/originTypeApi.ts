import { fetchData } from './fetchData';
import type { IFetchResponse } from './fetchData';
import { type JsonFormTemplate } from '../../components/common/JsonForm';
// import { stringToJsonFormTemplate } from '../../components/common/jsonFormUtils';

/**
 * DB Schema for pcnt.origin_type (assumed):
 * id serial (PK)
 * name text (AK)
 */

export interface OriginType {
  id: number;
  name: string;
}

// For dropdowns, we often want a specific structure
export interface OriginTypeOption {
  value: number; // Corresponds to origin_type.id
  label: string; // Corresponds to origin_type.name
  template?: JsonFormTemplate; // The parsed form template, optional
}

const ORIGIN_TYPE_TABLE_NAME = 'pcnt.origin_type';

// Intermediate interface for raw data from fetchData
interface RawOriginTypeData {
  value: number;
  label: string;
  template?: JsonFormTemplate;
  // template?: string | null;
}

const getOriginTypes = async (): Promise<OriginTypeOption[]> => {
  try {
    const response: IFetchResponse = await fetchData({
      from: ORIGIN_TYPE_TABLE_NAME,
      fields: 'origin_type_id AS value, name AS label, template',
      where: { enabled: true },
      order: 'name',
    });

    if (!Array.isArray(response)) {
      console.error(`[originTypeApi] Error fetching origin types: Response is not an array`, response);
      return [];
    }

    const rawItems: RawOriginTypeData[] = response as RawOriginTypeData[];
    return rawItems;

    // return rawItems.map((item) => {
    //   let parsedTemplate: JsonFormTemplate | undefined = undefined;
    //   if (item.template && typeof item.template === 'string') {
    //     try {
    //       parsedTemplate = stringToJsonFormTemplate(item.template);
    //     } catch (e) {
    //       console.error(`[originTypeApi] Error parsing template for origin type (value: ${item.value}):`, (e as Error).message);
    //       // parsedTemplate remains undefined, error is logged
    //     }
    //   }
    //   return {
    //     value: item.value,
    //     label: item.label,
    //     template: parsedTemplate,
    //   };
    // });
  } catch (err) {
    console.error(`[originTypeApi] Error fetching origin types:`, err);
    return []; // Return empty array on error to prevent crashes
  }
};

export const originTypeApi = {
  getOriginTypes,
};