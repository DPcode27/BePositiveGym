import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const URL = `${process.env.REACT_APP_SERVER_URL}/spreadsheet`;
const validMimeTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

const UploadFileForm = () => {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  // console.log(file);
  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file === null) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios({
        method: "post",
        url: URL,
        data: formData,
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(res.data);
      navigate("/");
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept={validMimeTypes} onChange={handleChange} />
      <button type="submit">Upload</button>
    </form>
  );
};

export default UploadFileForm;
