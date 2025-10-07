import { useState, useCallback, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  IDatasource,
  IGetRowsParams,
  GridReadyEvent,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

interface User {
  id: number;
  name: string;
  age: number;
}

function Table() {
  const [totalRows, setTotalRows] = useState(0);

  const columnDefs: ColDef<User>[] = useMemo(
    () => [
      {
        field: "id",
        sortable: true,
        filter: "agNumberColumnFilter",
        floatingFilter: true,
      },
      {
        field: "name",
        sortable: true,
        filter: "agTextColumnFilter",
        floatingFilter: true,
      },
      {
        field: "age",
        sortable: true,
        filter: "agNumberColumnFilter",
        floatingFilter: true,
      },
    ],
    []
  );

  const pageSize = 20;

  const datasource: IDatasource = useMemo(
    () => ({
      getRows: async (params: IGetRowsParams) => {
        console.log("Request params:", params);

        try {
          const queryParams = new URLSearchParams();

          // Pagination
          const startRow = params.startRow;
          const endRow = params.endRow;
          const page = Math.floor(startRow / pageSize);

          queryParams.append("page", page.toString());
          queryParams.append("pageSize", pageSize.toString());

          // Sorting
          if (params.sortModel && params.sortModel.length > 0) {
            queryParams.append("sortField", params.sortModel[0].colId);
            queryParams.append("sortOrder", params.sortModel[0].sort);
          }

          // Filtering
          if (params.filterModel) {
            Object.keys(params.filterModel).forEach((col) => {
              const filterModel = params.filterModel[col];
              if (
                filterModel.type === "contains" ||
                filterModel.type === "equals"
              ) {
                queryParams.append(`filter[${col}]`, filterModel.filter);
              } else if (
                filterModel.type === "greaterThan" ||
                filterModel.type === "lessThan"
              ) {
                queryParams.append(`filter[${col}]`, filterModel.filter);
                queryParams.append(`filterType[${col}]`, filterModel.type);
              } else if (filterModel.filter) {
                queryParams.append(`filter[${col}]`, filterModel.filter);
              }
            });
          }

          const res = await fetch(
            `http://localhost:3001/api/users?${queryParams.toString()}`
          );

          if (!res.ok) {
            console.error("Failed to fetch data");
            params.failCallback();
            return;
          }

          const data = await res.json();

          setTotalRows(data.total);

          // ВАЖНО: винаги подавай total като lastRow
          params.successCallback(data.rows, data.total);
        } catch (error) {
          console.error("Error fetching data:", error);
          params.failCallback();
        }
      },
    }),
    []
  );

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      params.api.setGridOption("datasource", datasource);
    },
    [datasource]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
      minWidth: 100,
      resizable: true,
    }),
    []
  );

  return (
    <div>
      <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
        <AgGridReact<User>
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowModelType="infinite"
          onGridReady={onGridReady}
          cacheBlockSize={pageSize}
          cacheOverflowSize={2}
          maxConcurrentDatasourceRequests={1}
          maxBlocksInCache={10}
          pagination={true}
          paginationPageSize={pageSize}
        />
      </div>
      <p>Общо записи: {totalRows}</p>
    </div>
  );
}

export default Table;
