import { useEffect, useState } from 'react';
import { fetchData } from '../api/fetchData';

export interface IRawDataView {
    subject_role: number,
    subject_id: string,
    product_id: string,
}

/*
SELECT cp3.js_select_b('{"from":"cp_rawdata.price_karma","fields":"*","where":{"adapter_key":{"adapter_key":"0"}}}')
> INFO:  {"from":"cp_rawdata.price_karma","where":{"adapter_key":{"adapter_key":"0"}},"fields":"*"}
> INFO:  SELECT * from cp_rawdata.price_karma where adapter_key='[object Object]'  
> ERROR:  invalid input syntax for type bigint: "[object Object]"
CONTEXT:  js_select_b() LINE 14: 	return  plv8.execute(_sql);

> Query Time: 0.287s
 */

interface IKeyValue {
    key: string,
    value: string,
}

const getRawData = async (subject_role: number, subject_id: string, product_id: string): Promise<IKeyValue[]> => {
    
    const adapter_keys = await fetchData({
        from: 'cp_rawdata.cp_product_adapted',
        fields: 'adapter_key',
        where: {subject_role, subject_id, product_id},
    })
    if (adapter_keys.length == 0)
        throw new Error('getRawData - cp_rawdata.cp_product_adapted - product has not found')

    const adapter_key = '' + adapter_keys[0].adapter_key

    const from = 'cp_rawdata.price_' + subject_id.toLowerCase()

    const rawDatas = await fetchData({
        from,
        fields: '*',
        where: {adapter_key},
    })

    if (rawDatas.length == 0)
        throw new Error(`getRawData - ${from} - product has not found`)

    const rawData = rawDatas[0]
    const result: IKeyValue[] = []
    for (const key in rawData) {
        if (Object.prototype.hasOwnProperty.call(rawData, key)) {
            const value = rawData[key];
            result.push({key, value})
        }
    }
    
    return result
}

const RawDataView: React.FC<IRawDataView> = ({subject_role, subject_id, product_id}) => {

    const [rawData,setRawData] = useState< IKeyValue[] >([]);

    const init = async () => {
        const rawdata = await getRawData(subject_role, subject_id, product_id)
        setRawData( rawdata);
    }
    useEffect( () => {
        init()
    }, [subject_role, subject_id, product_id, ])

    // console.log(rawData)

    return (
        <div>
            <table>
                <tr key={1}>
                    <th>subject_role</th>
                    <td>{subject_role}</td>
                </tr>
                <tr key={2}>
                    <th>subject_id</th>
                    <td>{subject_id}</td>
                </tr>
                <tr key={3}>
                    <th>product_id</th>
                    <td>{product_id}</td>
                </tr>
                <tr>
                    <th>Field</th>
                    <th>Value</th>
                </tr>
                {rawData.map((val, key) => {
                    return (
                        <tr key={key}>
                            <td>{val.key}</td>
                            <td>{val.value}</td>
                        </tr>
                    )
                })}
            </table>        
        </div>
    )
}

export default RawDataView
