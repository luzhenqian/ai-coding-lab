"use client";

type Column<T> = {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
};

export function DataTable<T>({ columns, data, keyField }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">No items found.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b dark:border-gray-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={String(item[keyField])}
              className="border-b hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm">
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
