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
import { useNavigate, useParams } from "react-router-dom";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";
import CheckIcon from "@mui/icons-material/Check";
import toast from "react-hot-toast";

const DELIMITER = "*/#/^~@!~|+";
const getUID = () => {
  return DELIMITER + uuidv4().toString();
};

const URL = `${process.env.REACT_APP_SERVER_URL}/spreadsheet/`;

const Test = (props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cols, setCols] = useState([]);
  const [data, setData] = useState([]);
  const [filename, setFilename] = useState("");

  const [isEditMode, setIsEditMode] = useState(props.isEditMode);
  let shouldSubmit = true;

  useEffect(() => {
    if (cols.length == 0) {
      addRow();
    }
  }, []);

  const addRow = () => {
    //REFACTOR NEEDED 👇
    if (!cols.length) {
      let newCol = getUID();
      const updatedCols = [...cols, newCol];
      const newRec = updatedCols.reduce(
        (acc, item) => ({ ...acc, [item]: "" }),
        {}
      );
      const newData = [...data, newRec];

      setData(newData);
      setCols(updatedCols);
      return;
    }
    //REFACTOR NEEDED 👆
    // console.log("Inside add row", cols);
    const newRec = cols.reduce((acc, item) => ({ ...acc, [item]: "" }), {});
    const newData = [...data, newRec];
    setData(newData);
  };

  const addCol = () => {
    const newCol = getUID();
    const newCols = [...cols, newCol];
    const newData = data.reduce((acc, record) => {
      const newRec = { ...record };
      newRec[newCol] = "";
      acc = [...acc, newRec];
      return acc;
    }, []);

    setCols(newCols);
    setData(newData);
  };

  const deleteRow = (e, id) => {
    const newData = data.filter((item, i) => i !== id);
    setData(newData);
  };

  const deleteCol = (e, col) => {
    const newCols = cols.filter((c) => c !== col);

    const newData = data.reduce((acc, record) => {
      const { [col]: _, ...newRec } = record;
      acc = [...acc, newRec];
      return acc;
    }, []);

    setCols(newCols);
    setData(newData);
  };

  const editRowCell = (row, col, value) => {
    const newData = [...data];
    newData[row][col] = value;
    setData(newData);
  };

  const editColCell = (e, i) => {
    // ISSUES
    // #1> Integers 🔢
    // #2> Empty blur check ✅
    // #3> Dupes (while typing or blur) 🤔
    // ISSUES
    let newCol = e.target.value;
    if (newCol === "") {
      newCol = getUID();
      shouldSubmit = false;
    } else if (cols.includes(newCol)) {
      // optimize time 🧠
      console.log("Column name already exists. Please choose a unique name.");
      shouldSubmit = false;
      return;
    }

    const oldCol = cols[i];
    const newCols = [...cols];
    newCols[i] = newCol;

    const newData = data.reduce((acc, record) => {
      const newRec = {};
      Object.entries(record).forEach(([key, value]) => {
        if (key === oldCol) {
          newRec[newCol] = record[oldCol];
        } else {
          newRec[key] = value;
        }
      });
      acc = [...acc, newRec];
      return acc;
    }, []);

    setCols(newCols);
    setData(newData);
    shouldSubmit = true;
  };

  const handleSubmit = async () => {
    if (!shouldSubmit || filename.length === 0) {
      toast.error("Please fill all the required fields");
      return;
    } // add toast
    try {
      if (Object.keys(data).length === 0) return;

      const payload = {
        filename: filename,
        filetype: "xlsx",
        filedata: [...data],
      };

      const res = await axios.post(
        URL + "create-file",
        { data: payload },
        { withCredentials: true }
      );
      navigate("/");
      toast.success("File created successfully");
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      setIsEditMode(false);
    }
  };
  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleBlur = (e) => {
    const value = e.target.value.trim();
    if (value === "") {
      alert("Input field cannot be empty");
      shouldSubmit = false;
    } else {
      shouldSubmit = true;
    }
  };

  const renderTableHeader = (col, id, fn) => {
    if (isEditMode) {
      if (col.startsWith(DELIMITER)) {
        shouldSubmit = false;
        return (
          <>
            <input
              value={""}
              placeholder="Enter column name"
              onChange={fn}
              onBlur={handleBlur}
            />
            <DeleteRoundedIcon
              onClick={(e) => deleteCol(e, col)}
              fontSize="large"
              color="error"
            >
              Delete
            </DeleteRoundedIcon>
          </>
        );
      } else {
        shouldSubmit = true;
        return (
          <>
            <input value={col} onChange={fn} onBlur={handleBlur} />
            <DeleteRoundedIcon
              onClick={(e) => deleteCol(e, col)}
              fontSize="large"
              color="error"
            >
              Delete
            </DeleteRoundedIcon>
          </>
        );
      }
    } else {
      return <h2>{col}</h2>;
    }
  };

  const renderTableCell = (row, col, fn) => {
    if (isEditMode) {
      return (
        <>
          <input value={row[col]} onChange={fn} />
        </>
      );
    } else {
      return <h2>{row[col]}</h2>;
    }
  };

  return (
    <div>
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
        </>
      )}
      <input
        className="px-4 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={filename}
        placeholder="Enter filename"
        onChange={(e) => setFilename(e.target.value)}
      />
      {/* <CheckIcon fontSize="large" color="success" className="cursor-pointer" /> */}
      {data.length && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {cols.map((col, id) => (
                  <TableCell key={id}>
                    {renderTableHeader(col, id, (e) => editColCell(e, id))}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, i) => {
                return (
                  <TableRow key={i}>
                    {Object.keys(data[0]).map((col) => {
                      return (
                        <TableCell key={i + col}>
                          {renderTableCell(row, col, (e) =>
                            editRowCell(i, col, e.target.value)
                          )}
                        </TableCell>
                      );
                    })}
                    {isEditMode && (
                      <TableCell>
                        <DeleteRoundedIcon
                          onClick={(e) => deleteRow(e, i)}
                          fontSize="large"
                          color="error"
                        >
                          Delete
                        </DeleteRoundedIcon>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default Test;
