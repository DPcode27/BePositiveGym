import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import React, { useState, useEffect, useRef } from "react";

const ControlledInput = (props) => {
  const { value, onChangeHandler, itemId } = props;
  const [cursor, setCursor] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const input = ref.current;
    if (input) input.setSelectionRange(cursor, cursor);
  }, [ref, cursor, value]);

  const handleChange = (e) => {
    setCursor(e.target.selectionStart);
    onChangeHandler && onChangeHandler(itemId, e.target.value);
  };

  return (
    <input
      className="px-4 py-1 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      ref={ref}
      value={value}
      onChange={handleChange}
    />
  );
};

const Items = ({
  id,
  itemId,
  val,
  isEditMode,
  rowId,
  colId,
  indexR,
  indexC,
  type,
  fixed,
  onChangeHandler,
  deleteHandler,
  fixedRowContainers,
  handelFixedRows,
}) => {
  const {
    attributes,
    setNodeRef,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type },
  });

  return (
    <div
      //   {...listeners}
      ref={setNodeRef}
      {...attributes}
      style={{ transition, transform: CSS.Translate.toString(transform) }}
      className={`m-1 px-2 py-2 shadow-md w-full border border-transparent border-2 flex 
        justify-between min-w-xs w-[320px] max-w-xs h-[70px] overflow-auto flex align-center
        ${isDragging ? "bg-gray-100" : "bg-white"}
          `}
    >
      <div
        className={`flex flex-row w-full justify-between align-center text-center`}
      >
        {indexR === 0 && !isEditMode && (
          <div className="flex flex-col justify-center">
            <DragIndicatorIcon
              className={`${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
              {...listeners}
            />
          </div>
        )}
        {indexR !== 0 && indexC === 0 && !isEditMode && (
          <div className="flex flex-col justify-center">
            <DragHandleIcon
              className={`${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
              {...listeners}
            />
          </div>
        )}
        <div className="flex flex-col justify-center">
          {isEditMode ? (
            <ControlledInput
              value={val}
              onChangeHandler={onChangeHandler}
              itemId={itemId}
            />
          ) : (
            <h1
              className={`px-4 ${
                rowId === "row-0" ? "text-2xl font-bold" : "text-xl"
              }`}
            >
              {val}
            </h1>
          )}
        </div>
        <div className="px-1 flex flex-col justify-center">
          {isEditMode && (indexC === 0 || indexR === 0) && (
            <DeleteRoundedIcon
              onClick={(e) => deleteHandler(indexR, indexC, type)}
              color="error"
            />
          )}
          {fixed ? (
            <PushPinIcon
              onClick={() => handelFixedRows(null, fixedRowContainers[indexR])}
            />
          ) : (
            <PushPinOutlinedIcon onClick={() => handelFixedRows(rowId, null)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Items;
