import { AgGridReact } from "ag-grid-react";
import { useState, useCallback } from "react";
import type { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import Table from "components/table";

export default function Dev() {
  return (
    <div>
      Development Page
      <Table />
    </div>
  );
}

// function Table() {
//   type RowData = { name: string; age: number };
//   //make rowData - array of 1000 objects with random names and ages
//   const [rowData] = useState<RowData[]>(() => {
//     const names = ["Alice", "Bob", "Charlie", "David", "Eve"];
//     return Array.from({ length: 1000 }, () => ({
//       name: names[Math.floor(Math.random() * names.length)],
//       age: Math.floor(Math.random() * 100),
//     }));
//   });
//   // const [rowData] = useState<RowData[]>([{ name: "Test", age: 25 }]);
//   const [colDefs] = useState<ColDef<RowData>[]>([
//     { field: "name" },
//     { field: "age" },
//   ]);

//   return (
//     <div className="ag-theme-alpine" style={{ height: 500 }}>
//       <AgGridReact<RowData>
//         rowData={rowData}
//         columnDefs={colDefs}
//         onSortChanged={(e) => {
//           console.log(e);
//         }}
//         onFilterChanged={(e) => {
//           console.log(e);
//         }}
//         onPaginationChanged={(e) => {
//           console.log(e);
//         }}
//       />
//     </div>
//   );
// }
