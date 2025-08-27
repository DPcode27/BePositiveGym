import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import formatDate from "../utils/dateFormat";
import toast from "react-hot-toast";
import SearchBar from "../components/Search/SearchBar";

const URL = `${process.env.REACT_APP_SERVER_URL}/spreadsheet`;
const QUERY_URL = `${process.env.REACT_APP_SERVER_URL}/util`;

const Home = () => {
  const [files, setFiles] = useState([]);
  const [errMsg, setErrMsg] = useState("");

  const [editedFilename, setEditedFilename] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();

    return () => {};
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(URL, { withCredentials: true });
      setFiles(res.data);
    } catch (error) {
      console.log(error.response.data);
      setErrMsg(error.response.data.message);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleClick = (id) => {
    navigate("/view/" + id);
  };

  const deleteRow = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this file?"
    );
    if (!isConfirmed) return;
    try {
      const res = await axios.delete(URL + "/" + id, { withCredentials: true });
      console.log(res.data);
      const newData = files.filter((item) => item.id !== id);
      setFiles(newData);
      toast.success("File deleted successfully");
    } catch (error) {
      console.log(error.response.data.message);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleEdit = (id, filename) => {
    setEditingId(id);
    setEditedFilename(filename);
  };

  const handleSave = async () => {
    try {
      const payload = editedFilename.split(".");

      const res = await axios.put(
        `${URL}/${editingId}/update-name`,
        { filename: payload[0], filetype: payload[1] },
        { withCredentials: true }
      );

      // const updatedFiles = files.map((file) =>
      //   file.id === editingId ? { ...file, filename: editedFilename } : file
      // );
      await fetchData();
      // setFiles(updatedFiles);
      setEditingId(null);
      setEditedFilename("");
      toast.success("Filename edited successfully!");
    } catch (error) {
      console.error("Error updating filename:", error.response.data.message);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const fetchSuggestions = async (query) => {
    try {
      const res = await axios.get(QUERY_URL + "/search?key=" + query, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.log(error.response.data);
      setErrMsg(error.response.data.message);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <SearchBar fetchSuggestions={fetchSuggestions} />
      {files.length > 0 ? (
        <>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 415 }}>
              <Table stickyHeader size="small" aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {["S. No. ", "File", "Last Modified", "Actions"].map(
                      (item, i) => (
                        <TableCell key={i}>
                          <h2 className="text-2xl font-bold">{item}</h2>
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item, i) => {
                      return (
                        <TableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={item.id}
                        >
                          <TableCell onClick={() => handleClick(item.id)}>
                            <h3 className="text-lg">{item.id}</h3>
                          </TableCell>
                          <TableCell>
                            {editingId === item.id ? (
                              <div className="flex">
                                <input
                                  className="px-4 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={editedFilename}
                                  onChange={(e) =>
                                    setEditedFilename(e.target.value)
                                  }
                                />
                                <CheckIcon
                                  onClick={handleSave}
                                  fontSize="large"
                                  color="success"
                                  className="cursor-pointer"
                                />
                                <ClearIcon
                                  onClick={() => setEditingId(null)}
                                  fontSize="large"
                                  color="error"
                                  className="cursor-pointer"
                                />
                              </div>
                            ) : (
                              <h3
                                className="text-lg cursor-pointer"
                                onClick={() => handleClick(item.id)}
                              >
                                {item.filename}
                              </h3>
                            )}
                          </TableCell>
                          <TableCell>
                            <h3 className="text-lg">
                              {formatDate(item.updatedAt)}
                            </h3>
                          </TableCell>
                          <TableCell>
                            <DeleteForeverRoundedIcon
                              onClick={() => deleteRow(item.id)}
                              color="error"
                              fontSize="large"
                              className="cursor-pointer"
                            />
                            {editingId === item.id ? (
                              <ClearIcon
                                onClick={() => setEditingId(null)}
                                fontSize="large"
                                color="error"
                                className="cursor-pointer"
                              />
                            ) : (
                              <EditOutlinedIcon
                                onClick={() =>
                                  handleEdit(item.id, item.filename)
                                }
                                color="primary"
                                fontSize="large"
                                className="cursor-pointer"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 100]}
              component="div"
              count={files.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </>
      ) : (
        <>
          <h3>Nothing to show :(</h3>
          <Link to="/login">
            <Button variant="contained" color="success">
              Login
            </Button>
          </Link>
          <h3>{errMsg}</h3>
        </>
      )}
    </>
  );
};

export default Home;
