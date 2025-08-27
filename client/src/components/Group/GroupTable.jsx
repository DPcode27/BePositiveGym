import React, { useState, useMemo } from "react";
import { DndContext } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { v4 as uuidv4 } from "uuid";
import Item from "./Item";

const getUID = () => {
  return uuidv4().toString();
};

const GroupTable = (props) => {
  let initData = [];
  const cols = Object.keys(props.rows[0])
    .filter((k) => k !== "id")
    .map((k, i) => ({
      id: getUID(),
      rowId: "row-" + 0,
      colId: "col-" + i,
      data: k,
    }));

  initData.push(cols);

  props.rows.map((row, idx) => {
    initData.push(
      Object.keys(row)
        .filter((k) => k !== "id")
        .map((k, i) => ({
          id: getUID(),
          rowId: "row-" + (idx + 1),
          colId: "col-" + i,
          data: row[k],
        }))
    );
  });

  const [data, setData] = useState(initData);
  const [groupedColumns, setGroupedColumns] = useState([]);

  console.log(data);

  // Extract columns from the first row
  const columns = data[0].map((col) => col.data);

  // Group data by multiple columns
  const groupData = () => {
    if (groupedColumns.length === 0) return null;

    const grouped = data.slice(1).reduce((acc, row) => {
      const groupKey = groupedColumns
        .map(
          (colId) => row[data[0].findIndex((col) => col.colId === colId)].data
        )
        .join(" | ");

      acc[groupKey] = acc[groupKey] || [];
      acc[groupKey].push(row);
      return acc;
    }, {});

    return grouped;
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && over.id === "group-area") {
      if (!groupedColumns.includes(active.id)) {
        setGroupedColumns((prev) => [...prev, active.id]);
      }
    }
  };

  const removeGrouping = () => {
    setGroupedColumns([]);
  };

  const groupedData = groupData();

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <div className="container w-full h-[85vh] overflow-auto flex flex-col border border-gray-300 bg-gray-100">
        <DndContext onDragEnd={handleDragEnd}>
          <div>
            <DroppableArea
              groupedColumns={groupedColumns}
              setGroupedColumns={setGroupedColumns}
              data={data}
            />
            {groupedColumns.length > 0 && (
              <button onClick={removeGrouping} style={{ margin: "10px 0" }}>
                Remove Grouping
              </button>
            )}
          </div>

          <div className="w-max">
            <div className="flex">
              {columns.map((col, index) => (
                <DraggableColumn key={index} id={`col-${index}`}>
                  <th>{col}</th>
                </DraggableColumn>
              ))}
            </div>
            {groupedData
              ? Object.keys(groupedData).map((groupKey, i) => (
                  <div key={i}>
                    <h1 className="px-4 py-2 text-xl font-bold">
                      Group: {groupKey}
                    </h1>
                    {groupedData[groupKey].map((row, rowI) => (
                      <div key={rowI} className="flex">
                        {row.map((item, colI) => (
                          <Item val={item.data} rowId={item.rowId} />
                        ))}
                      </div>
                    ))}
                  </div>
                ))
              : data.slice(1).map((row, rowI) => (
                  <div key={rowI} className="flex">
                    {row.map((item, colI) => (
                      <Item val={item.data} rowId={item.rowId} />
                    ))}
                  </div>
                ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

// Draggable Column Header
const DraggableColumn = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useDraggable({ id });

  const style = {
    transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
    transition,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="m-1 px-2 py-2 shadow-md w-full border border-transparent border-2 flex 
        justify-between min-w-xs w-[320px] max-h-[100px] overflow-auto
        bg-white"
      {...attributes}
      {...listeners}
    >
      <div className={`flex flex-row "justify-start"`}>
        <h1 className={`text-2xl font-bold`}>{children}</h1>
      </div>
    </div>
  );
};

// Droppable Area
const DroppableArea = ({ groupedColumns, setGroupedColumns, data }) => {
  const { setNodeRef, isOver } = useDroppable({ id: "group-area" });

  const style = {
    minHeight: "50px",
    backgroundColor: isOver ? "lightgreen" : "lightgray",
    border: "1px dashed black",
    marginBottom: "20px",
    padding: "10px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  };

  const handleRemove = (colId) => {
    setGroupedColumns((prev) => prev.filter((id) => id !== colId));
  };

  return (
    <div ref={setNodeRef} style={style}>
      {groupedColumns.length > 0 ? (
        groupedColumns.map((colId) => (
          <div
            key={colId}
            style={{
              padding: "5px 10px",
              background: "white",
              border: "1px solid black",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            {data[0].find((col) => col.colId === colId).data}
            <button onClick={() => handleRemove(colId)}>X</button>
          </div>
        ))
      ) : (
        <span>Drop columns here to group</span>
      )}
    </div>
  );
};

export default GroupTable;
