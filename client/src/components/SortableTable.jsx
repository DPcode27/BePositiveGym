import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  MouseSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { Button } from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";

import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMemo, useState, useEffect } from "react";

import {
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import Items from "./Items";
import { v4 as uuidv4 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { initialize, updateCell, undo, redo } from "../redux/tableSlice";
import download from "downloadjs";
import toast from "react-hot-toast";

const URL = `${process.env.REACT_APP_SERVER_URL}/spreadsheet/`;

const getUID = () => {
  return uuidv4().toString();
};

const getCols = (data) => {
  return data[0].map((item) => item.data);
};

const convertToPayloadType = (data) => {
  const cols = getCols(data);
  return data.slice(1).reduce((acc, item) => {
    let obj = {};
    // console.log(item);
    cols.forEach((col, i) => {
      obj = { ...obj, [col]: item[i].data };
    });
    return [...acc, obj];
  }, []);
};

const SortableTable = (props) => {
  const { id } = useParams();
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

  const dispatch = useDispatch();
  const { past, present, future } = useSelector((state) => state.tableData);

  useEffect(() => {
    dispatch(initialize(initData));
  }, []);
  //make shift ISSUE HERE
  useEffect(() => {
    setContainers(present);
    setColumnIds(present[0]?.map((item) => item.colId));
    setRowIds(present?.map((row) => row[0].rowId));
  }, [present]);

  // const memoizedData = useMemo(() => initData, []);
  // NEED THIS AS FN AS containers is not available 🤯
  const initCols = () => containers[0]?.map((item) => item.colId);
  const initRows = () => containers?.map((row) => row[0].rowId);

  const [containers, setContainers] = useState(initData);
  const [activeId, setActiveId] = useState(null);
  const [columnHover, setColumnHover] = useState(false);
  const [columnIds, setColumnIds] = useState(initCols());
  const [rowIds, setRowIds] = useState(initRows());
  const [isEditMode, setIsEditMode] = useState(props.isEditMode);
  const [fixedRowContainers, setFixedRowContainers] = useState([]);
  const [fixedColContainers, setFixedColContainers] = useState([]);
  console.log("CONTAINERS - ", containers);
  // console.log("Col id - ", columnIds);
  // console.log("row id - ", rowIds);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        event.preventDefault();
        dispatch(undo());
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "y") {
        event.preventDefault();
        dispatch(redo());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(MouseSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const { id } = active;
    setActiveId(id);
  };

  const handleDragMove = (event) => {};

  const handleDragEnd = (event) => {
    const { active, over } = event;
    // row swap
    if (
      activeId.toString().includes("row") &&
      activeId.toString().includes("row") &&
      active &&
      over &&
      activeId !== over.id
    ) {
      const activeRowIndex = containers.findIndex((row) => {
        if (activeId === row[0].rowId) return true;
      });
      let overRowIndex = activeRowIndex;
      overRowIndex = containers.findIndex((row) => {
        if (over.id === row[0].rowId) return true;
      });

      overRowIndex = overRowIndex === 0 ? activeRowIndex : overRowIndex;
      overRowIndex = overRowIndex === -1 ? activeRowIndex : overRowIndex;

      let newCont = [...containers];
      newCont = arrayMove(newCont, activeRowIndex, overRowIndex);

      setContainers(newCont);
      setRowIds(newCont.map((row) => row[0].rowId));
    }

    // col swap
    else if (
      activeId.toString().includes("col") &&
      activeId.toString().includes("col") &&
      active &&
      over &&
      activeId !== over.id
    ) {
      // console.log(activeId, over.id);
      let activeColIndex = -1;
      containers.forEach((row) => {
        for (let i in row) {
          if (activeId === row[i].colId) {
            activeColIndex = i;
            break;
          }
        }
      });
      let overColIndex = activeColIndex;
      containers.forEach((row) => {
        for (let i in row) {
          if (over.id === row[i].colId) {
            overColIndex = i;
            break;
          }
        }
      });

      const newCont = [...containers];
      newCont.forEach((row, i) => {
        newCont[i] = arrayMove(row, activeColIndex, overColIndex);
      });
      setContainers(newCont);
      setColumnIds(newCont[0].map((items) => items.colId));
    }
    setActiveId(null);
  };

  function handleHover(rowI) {
    if (rowI === 0) setColumnHover(true);
    else setColumnHover(false);
  }

  const editRowCell = (id, val) => {
    const newData = JSON.parse(JSON.stringify(containers));
    let rowI = -1;
    let colI = -1;
    // console.log(newData);
    for (let i in newData) {
      colI = newData[i].findIndex((item) => item.id === id);
      if (colI !== -1) {
        rowI = i;
        break;
      }
    }
    // console.log(id, val);
    const rowId = newData[rowI][colI].rowId;
    const colId = newData[rowI][colI].colId;
    dispatch(updateCell({ rowId, colId, newData: val }));
    // console.log(val);
    // console.log(id, rowI, colI);
    // newData[rowI][colI] = { ...newData[rowI][colI], data: val };
    // console.log("init val - ", newData[rowI][colI]);
    // console.log("new val - ", val);
    // setContainers(newData);
  };

  const addRow = () => {
    const newData = JSON.parse(JSON.stringify(containers));
    const cols = getCols(containers);
    const len = newData.length;
    const uRowId = getUID();
    const newRow = cols.reduce((acc, c, i) => {
      const obj = {
        id: getUID(),
        rowId: "row-" + uRowId,
        colId: "col-" + i,
        data: "",
      };

      return [...acc, obj];
    }, []);
    newData.push(newRow);
    dispatch(initialize(newData));
    // setContainers(newData);
  };

  const addCol = () => {
    let newData = JSON.parse(JSON.stringify(containers));
    const colLen = newData[0].length;
    const uColId = getUID();
    newData.forEach((row, i) => {
      const obj = {
        id: getUID(),
        rowId: row[0]?.rowId,
        colId: "col-" + uColId,
        data: "",
      };

      row.push(obj);
    });
    // console.log(newData);
    dispatch(initialize(newData));
    // setContainers(newData);
  };

  const deleteRowOrCol = (row, col, type) => {
    console.log("Abt to Delete - ", row, col, type);
    let newData = JSON.parse(JSON.stringify(containers));
    if (type === "row") {
      newData = newData.filter((_, i) => i !== row);
      console.log("delete row - ", newData);
      dispatch(initialize(newData));
      // setContainers(newData);
    } else {
      newData = newData.map((row) => row.filter((item, i) => i !== col));
      dispatch(initialize(newData));
      // setContainers(newData);
    }
  };

  const handleSubmit = async () => {
    const showSuccess = () => toast.success("Changes saved successfully!");
    const showError = () =>
      toast.error("Something went wrong :( Please try again.");

    try {
      const payload = convertToPayloadType(containers);
      await axios.put(
        URL + "/" + id,
        { data: payload },
        { withCredentials: true }
      );
      showSuccess();
    } catch (err) {
      console.log(err);
      showError();
    } finally {
      setIsEditMode(false);
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handelFixedRows = (rowAdd, rowRem) => {
    if (rowAdd !== null) setFixedRowContainers([...fixedRowContainers, rowAdd]);
    else
      setFixedRowContainers(
        fixedRowContainers.filter((item) => item !== rowRem)
      );
  };

  const handleFixedCols = (colAdd, colRem) => {
    if (colAdd !== null) {
    }
  };

  const downloadFile = async (filename) => {
    try {
      const response = await axios.get(`${URL}download/${id}`, {
        responseType: "blob",
        withCredentials: true,
      });

      const data = response.data;
      download(data, filename);
      toast.success("Downloaded syccessfully!");
    } catch (error) {
      console.error("Error downloading the file:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const downloadExcel = () => {
    const showSuccess = () => toast.success("Downloaded syccessfully!");
    const showError = () =>
      toast.error("Something went wrong. Please try again.");

    const filename = window.prompt(
      "Enter a file name for the Excel file:",
      "TableData"
    );
    downloadFile(filename);
  };

  // console.log(fixedRowContainers);
  return (
    <>
      {isEditMode ? (
        <>
          <Button variant="contained" color="success" onClick={addRow}>
            Add Row
          </Button>
          <Button variant="contained" color="success" onClick={addCol}>
            Add Column
          </Button>
          {/* <Button variant="contained" color="success" onClick={handleSave}>
            Save
          </Button> */}
          <Button variant="contained" color="success" onClick={handleSubmit}>
            Submit
          </Button>
        </>
      ) : (
        <>
          <Button onClick={handleEditClick} variant="contained" color="primary">
            Edit
          </Button>
          <Button variant="contained" color="success" onClick={downloadExcel}>
            Export
          </Button>
        </>
      )}
      <div className="flex flex-col items-center justify-center mt-10">
        {/*Fixed Rows */}
        <div className="container w-full overflow-auto flex flex-col border border-gray-300 bg-gray-100">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            modifiers={[
              columnHover ? restrictToHorizontalAxis : restrictToVerticalAxis,
            ]}
          >
            <SortableContext
              items={columnHover ? columnIds : rowIds}
              strategy={
                columnHover
                  ? horizontalListSortingStrategy
                  : verticalListSortingStrategy
              }
            >
              <div className="w-max">
                {containers
                  .filter((row, i) => fixedRowContainers.includes(row[0].rowId))
                  .map((row, rowI) => (
                    <div
                      key={rowI}
                      className="flex"
                      onMouseEnter={() => handleHover(rowI)}
                      onMouseLeave={() => handleHover(rowI)}
                    >
                      {row.map((item, colI) => (
                        <Items
                          key={item.id}
                          id={columnHover ? item.colId : item.rowId}
                          val={item.data}
                          itemId={item.id}
                          isEditMode={isEditMode}
                          type={columnHover ? "col" : "row"}
                          indexR={rowI}
                          indexC={colI}
                          rowId={item.rowId}
                          colId={item.colId}
                          fixed={true}
                          onChangeHandler={editRowCell}
                          deleteHandler={deleteRowOrCol}
                          fixedRowContainers={fixedRowContainers}
                          handelFixedRows={handelFixedRows}
                        />
                      ))}
                    </div>
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        {/*Rest Table */}
        <div className="container w-full h-[480px] overflow-auto flex flex-col border border-gray-300 bg-gray-100">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            modifiers={[
              columnHover ? restrictToHorizontalAxis : restrictToVerticalAxis,
            ]}
          >
            <SortableContext
              items={columnHover ? columnIds : rowIds}
              strategy={
                columnHover
                  ? horizontalListSortingStrategy
                  : verticalListSortingStrategy
              }
            >
              <div className="w-max">
                {containers
                  .filter(
                    (row, i) => !fixedRowContainers.includes(row[0].rowId)
                  )
                  .map((row, rowI) => (
                    <div
                      key={rowI}
                      className="flex"
                      onMouseEnter={() => handleHover(rowI)}
                      onMouseLeave={() => handleHover(rowI)}
                    >
                      {row.map((item, colI) => (
                        <Items
                          key={item.id}
                          id={columnHover ? item.colId : item.rowId}
                          val={item.data}
                          itemId={item.id}
                          isEditMode={isEditMode}
                          type={columnHover ? "col" : "row"}
                          indexR={rowI}
                          indexC={colI}
                          onChangeHandler={editRowCell}
                          deleteHandler={deleteRowOrCol}
                          fixedRowContainers={fixedRowContainers}
                          fixedColContainers={fixedColContainers}
                          rowId={item.rowId}
                          colId={item.colId}
                          fixed={false}
                          handelFixedRows={handelFixedRows}
                        />
                      ))}
                    </div>
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        {/*Fixed Cols */}
      </div>
    </>
  );
};

export default SortableTable;
