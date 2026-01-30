import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext.tsx";
import { DataTable } from "primereact/datatable";
import type { DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";

import './tableData.css'

interface TableRow {
  id: number;
  title?: string;
  place_of_origin?: string;
  artist_display?: string;
  inscriptions?: string;
  date_start?: string;
  date_end?: string;
}

function TableData() {
  // fetching page data from AppContext, using UseContext
  const {
    page,
    total,
    loading,
    pageData,
    handlerPageChange
    } = useContext(AppContext) as {
    page: number;
    totalPage: number;
    total: number;
    loading: boolean;
    pageData: TableRow[];
    handlerPageChange: (page: number) => void;
  };

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [virtualCount, setVirtualCount] = useState<number>(0);
  const [showSelectBox, setShowSelectBox] = useState<boolean>(false);
  const [selectCount, setSelectCount] = useState<string>("");

  const handleSelectRows = (): void => {
    const count = Number(selectCount);
    if (!count || count <= 0) return;

    const pageSize = pageData.length;

    // select only current page rows
    const selectUpto = Math.min(count, pageSize);

    const ids = pageData.slice(0, selectUpto).map((row) => row.id);

    setSelectedIds((prev) => {
      const remaining = prev.filter(
        (id) => !pageData.some((row) => row.id === id)
      );
      return [...remaining, ...ids];
    });

    //store actual number user entered
    setVirtualCount(count);

    setShowSelectBox(false);
  };

  const columns = [
    { field: "title", header: "TITLE" },
    { field: "place_of_origin", header: "PLACE OF ORIGIN" },
    { field: "artist_display", header: "ARTIST" },
    { field: "inscriptions", header: "INSCRIPTIONS" },
    { field: "date_start", header: "START DATE" },
    { field: "date_end", header: "END DATE" }
  ];

  const totalSelected =
    virtualCount > selectedIds.length
      ? virtualCount
      : selectedIds.length;

  return (
    <div className="top_container">

      {totalSelected > 0 && (
        <div>
          Selected : {totalSelected} row
          {totalSelected > 1 ? "s" : ""}
        </div>
      )}

      {showSelectBox && (
        <div className="custom_select_box">

          <h4 className="custom_select_box_heading">Select Multiple Rows</h4>

          <p className="custom_select_box_para">Enter number of rows to select (current page)</p>

          <input className="custom_select_box_input"
            type="number"
            min={1}
            max={pageData.length}
            value={selectCount}
            onChange={(e) =>
              setSelectCount(e.target.value)
            }
          />

          <button
            className="p-button p-button-sm"
            onClick={handleSelectRows}
          >
            Select
          </button>
        </div>
      )}

      <DataTable
        value={pageData}
        loading={loading}
        showGridlines
        stripedRows
        paginator
        lazy

        scrollable

        selectionMode="multiple"

        rows={pageData.length}
        totalRecords={total}
        first={(page - 1) * pageData.length}
        onPage={(e: DataTablePageEvent) =>
          handlerPageChange(e.page! + 1)
        }

        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        paginatorTemplate="CurrentPageReport PrevPageLink PageLinks NextPageLink"

        dataKey="id"
        selection={pageData.filter((row) =>
          selectedIds.includes(row.id)
        )}

        onSelectionChange={(e) => {
          const currentPageIds = (
            e.value as TableRow[]
          ).map((row) => row.id);

          // manual selection overrides virtual selection
          if (virtualCount > 0 && e.value.length > 0) {
            setVirtualCount(0);
          }

          setSelectedIds((prevIds) => {
            const remaining = prevIds.filter(
              (id) =>
                !pageData.some(
                  (row) => row.id === id
                )
            );

            const updated = [
              ...remaining,
              ...currentPageIds
            ];

            if (virtualCount > 0) {
              const removed =
                prevIds.length - updated.length;

              if (removed > 0) {
                setVirtualCount((prev) =>
                  Math.max(prev - removed, 0)
                );
              }
            }

            return updated;
          });
        }}
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3.5rem" }}
          header={() => (
            <div className="multiple_col_style">
              <i
                className={`pi pi-chevron-${
                  showSelectBox ? "up" : "down"
                } custom_row_select`}

                onClick={(e) => {
                  e.stopPropagation();
                  setShowSelectBox((prev) => !prev);
                }}
              />
            </div>
          )}
        />

        {columns.map((col, index) => (
          <Column
            key={index}
            field={col.field}
            header={col.header}
            body={(rowData: TableRow) => {
              const value =
                rowData[col.field as keyof TableRow];

              if (!value) return "N/A";

              return String(value).length > 35
                ? String(value).slice(0, 35) + "..."
                : value;
            }}
          />
        ))}
      </DataTable>
    </div>
  );
}

export default TableData;
