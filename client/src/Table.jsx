import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useState, useRef } from "react";
import { Button } from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

const URL = `${process.env.REACT_APP_SERVER_URL}/spreadsheet/`;
// let colCounter;

const getUID = () => {
  return "###" + Date.now().toString();
};

function BasicTable(props) {
  const { id } = useParams();

  const initialRows = props.rows.map((row) => row.id);
  const initialCols = Object.keys(props.rows[0]).filter((key) => key !== "id");
  const initialData = props.rows.reduce((acc, row) => {
    acc[row.id] = { ...row };
    return acc;
  }, {});

  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);
  const [data, setData] = useState(initialData);

  const [isEditMode, setIsEditMode] = useState(props.isEditMode);
  let shouldSubmit = true;

  const inputRefs = useRef([]);
  const focusIndex = useRef(null);

  useEffect(() => {
    if (focusIndex.current !== null && inputRefs.current[focusIndex.current]) {
      inputRefs.current[focusIndex.current].focus();
      focusIndex.current = null; // Reset the focusIndex after focusing
    }
  });

  const addRow = () => {
    const newRow = rows.length > 0 ? rows[rows.length - 1] + 1 : 0;
    if (cols.length === 0) addCol();
    let prevRowId;
    if (rows.length === 0) prevRowId = -1;
    else prevRowId = Number(data[rows[rows.length - 1]].id);
    setRows([...rows, newRow]);
    setData({
      ...data,
      [newRow]: cols.reduce((acc, col) => ({ ...acc, [col]: "" }), {
        id: prevRowId + 1,
      }),
    });
  };

  const addCol = () => {
    let newCol = "Col ";
    // if (cols.length === 0) colCounter = 1;
    // else colCounter = Number(cols[cols.length - 1].split(" ")[1]) + 1;
    // console.log(getUID())
    // newCol += colCounter;
    // colCounter += 1;
    newCol = getUID();
    setCols([...cols, newCol]);
    setData(
      rows.reduce(
        (acc, row) => ({ ...acc, [row]: { ...data[row], [newCol]: "" } }),
        {}
      )
    );
    // if (rows.length === 0) addRow();
  };

  const handleEdit = (row, col, value) => {
    setData({ ...data, [row]: { ...data[row], [col]: value } });
  };

  const handleColEdit = (index, newName) => {
    const oldName = cols[index];
    const updatedCols = [...cols];
    updatedCols[index] = newName;

    // Update the data keys with the new column name
    const updatedData = Object.keys(data).reduce((acc, rowId) => {
      const { [oldName]: value, ...rest } = data[rowId];
      acc[rowId] = { ...rest, [newName]: value };
      return acc;
    }, {});

    setCols(updatedCols);
    setData(updatedData);

    focusIndex.current = index;
  };

  const deleteRow = (rowId) => {
    const updatedRows = rows.filter((row) => row !== rowId);
    setRows(updatedRows);

    const { [rowId]: _, ...remainingData } = data;

    setData(remainingData);
  };

  const deleteCol = (colId) => {
    if (cols.length === 1) {
      setRows([]);
      setCols([]);
      setData({});
      return;
    }

    const colIndex = cols.indexOf(colId);

    if (colIndex > -1) {
      // Remove column from cols array
      const updatedCols = [...cols];
      updatedCols.splice(colIndex, 1);
      setCols(updatedCols);

      // Remove the column from each row in data
      const updatedData = Object.keys(data).reduce((acc, rowId) => {
        const { [colId]: _, ...remainingCols } = data[rowId];
        acc[rowId] = remainingCols;
        return acc;
      }, {});

      setData(updatedData);
    }
  };

  const handleSave = () => {
    localStorage.setItem("1", JSON.stringify(data));
  };

  const handleSubmit = async () => {
    if (!shouldSubmit) return; // add toast
    try {
      if (Object.keys(data).length === 0) return;

      const payload = Object.values(data).map((item) => {
        const { id, ...rest } = item;
        return rest;
      });

      const res = await axios.put(
        URL + "/" + id,
        { data: payload },
        { withCredentials: true }
      );
      console.log(res);
    } catch (err) {
      console.log(err);
    } finally {
      setIsEditMode(false);
    }
  };

  const renderTableHeader = (col, index, fn) => {
    if (isEditMode) {
      if (col.startsWith("###")) {
        shouldSubmit = false;
        return (
          <TableCell key={col}>
            <input
              type="text"
              placeholder="Enter Column Name"
              ref={(el) => (inputRefs.current[index] = el)}
              onChange={fn}
            />{" "}
            {isEditMode ? (
              <DeleteRoundedIcon
                onClick={() => deleteCol(col)}
                fontSize="large"
                color="error"
              >
                Delete
              </DeleteRoundedIcon>
            ) : (
              ""
            )}
          </TableCell>
        );
      } else {
        shouldSubmit = true;
        return (
          <TableCell key={col}>
            <input
              type="text"
              value={col}
              ref={(el) => (inputRefs.current[index] = el)}
              onChange={fn}
            />{" "}
            {isEditMode ? (
              <DeleteRoundedIcon
                onClick={() => deleteCol(col)}
                fontSize="large"
                color="error"
              >
                Delete
              </DeleteRoundedIcon>
            ) : (
              ""
            )}
          </TableCell>
        );
      }
    } else {
      return (
        <TableCell key={col}>
          <h3>{col}</h3>
        </TableCell>
      );
    }
  };

  const renderTableCell = (row, col, fn) => {
    if (isEditMode) {
      return <input type="text" value={data[row][col] || ""} onChange={fn} />;
    } else {
      return <h3>{data[row][col] || ""}</h3>;
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

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
          <Button variant="contained" color="success" onClick={handleSave}>
            Save
          </Button>
          <Button variant="contained" color="success" onClick={handleSubmit}>
            Submit
          </Button>
        </>
      ) : (
        <>
          <Button onClick={handleEditClick} variant="contained" color="primary">
            Edit
          </Button>
        </>
      )}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {cols.map((col, index) => {
                return renderTableHeader(col, index, (e) =>
                  handleColEdit(index, e.target.value)
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row}>
                {cols.map((col) => (
                  <TableCell key={col}>
                    {renderTableCell(row, col, (e) =>
                      handleEdit(row, col, e.target.value)
                    )}
                  </TableCell>
                ))}
                {isEditMode ? (
                  <TableCell>
                    <DeleteRoundedIcon
                      onClick={() => deleteRow(row)}
                      fontSize="large"
                      color="error"
                    >
                      Delete
                    </DeleteRoundedIcon>
                  </TableCell>
                ) : (
                  ""
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default BasicTable;
