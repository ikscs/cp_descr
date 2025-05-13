import { type Column } from '../../types';

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
}

const Table = <T extends {}>({ data, columns }: TableProps<T>) => {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.header}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            {columns.map((column, colIndex) => (
              <td key={colIndex}>
                {column.render ? column.render(item) : (item as any)[column.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;