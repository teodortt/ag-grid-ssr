import { useState, useCallback, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  IDatasource,
  IGetRowsParams,
  GridReadyEvent,
  CellValueChangedEvent,
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
        editable: true,
      },
      {
        field: "age",
        sortable: true,
        filter: "agNumberColumnFilter",
        floatingFilter: true,
        editable: true,
        cellEditor: "agNumberCellEditor", // Numeric editor
        cellEditorParams: {
          min: 0,
          max: 120,
          precision: 0,
        },
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

          const startRow = params.startRow;
          const endRow = params.endRow;
          const page = Math.floor(startRow / pageSize);

          queryParams.append("page", page.toString());
          queryParams.append("pageSize", pageSize.toString());

          if (params.sortModel && params.sortModel.length > 0) {
            queryParams.append("sortField", params.sortModel[0].colId);
            queryParams.append("sortOrder", params.sortModel[0].sort);
          }

          if (params.filterModel) {
            Object.keys(params.filterModel).forEach((col) => {
              const filterModel = params.filterModel[col];

              if (
                filterModel &&
                filterModel.filter != null &&
                filterModel.filter !== ""
              ) {
                queryParams.append(
                  `filter_${col}`,
                  filterModel.filter.toString()
                );

                if (filterModel.type) {
                  queryParams.append(`filterType_${col}`, filterModel.type);
                }
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

  const onCellValueChanged = useCallback(
    async (event: CellValueChangedEvent<User>) => {
      console.log("Cell value changed:", event);

      const { data, colDef, oldValue, newValue } = event;

      // Ако стойността не се е променила, не правим нищо
      if (oldValue === newValue) {
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3001/api/users/${data.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              field: colDef.field,
              value: newValue,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update");
        }

        const result = await response.json();
        console.log("Update successful:", result);
      } catch (error) {
        console.error("Error updating cell:", error);
        alert("Грешка при запазване!");

        event.node.setDataValue(colDef.field!, oldValue);
      }
    },
    []
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
          onCellValueChanged={onCellValueChanged}
          singleClickEdit={false}
          stopEditingWhenCellsLoseFocus={true}
        />
      </div>
      <p>Общо записи: {totalRows}</p>
    </div>
  );
}

export default Table;
