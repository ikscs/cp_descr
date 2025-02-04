import React from 'react';
import { useUpsert } from './UpsertContext';

const Table: React.FC = () => {
  const { upsertCount, rowHeaders, columnHeaders, upsertData: tableData, setUpsertData: setTableData, referenceData } = useUpsert();

  const handleChange = (rowKey: string, colKey: string, value: number) => {
    setTableData((prevData) =>
      prevData.map((data) =>
        data.rowKey === rowKey && data.colKey === colKey ? { ...data, value } : data
      )
    );
  };

  const reset = () => {
    setTableData(prevData => 
      prevData.map(data => ({ ...data, value: 9 })))
  };

  return (
    <div>
        <h3>Установить статус</h3>
        <h5>Количество товаров: {upsertCount}</h5>
        <table>
        <thead>
          <tr>
            <th></th>
            {columnHeaders.map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
          </thead>
          <tbody>
          {rowHeaders.map((rowKey) => (
            <tr key={rowKey}>
              <td>{rowKey}</td>
              {columnHeaders.map((colKey) => (
                <td key={colKey} width={200} align='center'>
                  <select
                    value={tableData.find((data) => data.rowKey === rowKey && data.colKey === colKey)?.value || 0}
                    onChange={(e) => handleChange(rowKey, colKey, Number(e.target.value))}
                  >
                    {Object.entries(referenceData).map(([refKey, refValue]) => (
                      <option value={refKey}>{refValue}</option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {/* <tbody>
          {Object.entries(rowHeaders).map(([rowKey, rowLabel]) => (
            <tr key={rowKey}>
              <td>{rowLabel}</td>
              {Object.entries(columnHeaders).map(([colKey]) => (
                <td key={colKey} width={200} align='center'>
                  <select
                    value={tableData.find((data) => data.rowKey === rowKey && data.colKey === colKey)?.value || 0}
                    onChange={(e) => handleChange(rowKey, colKey, Number(e.target.value))}
                  >
                    {Object.entries(referenceData).map(([refKey, refValue]) => (
                      <option key={refKey} value={refValue}>
                        {refValue}
                      </option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody> */}
      </table>
      <div>
        <br/>
        <button onClick={() => console.log('Changes confirmed:', tableData)}>Ok</button>
        <button onClick={() => console.log('Changes canceled')}>Cancel</button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  );
};

export default Table;

// построить компоненту с контекстом:
// таблица для ввода,
// заголовки строк - массив ключ-значение,
// заголовки столбцов - массив ключ-значение,
// ячейки - числа (выбор из массива-справочника ключ-значение) - массив (ключ строки,ключ столбца,значение)
// заголовки строк, заголовки столбцов, ячейки, массива-справочник передвть через контекст
// + ok, cancel