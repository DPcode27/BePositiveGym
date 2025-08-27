import { Button } from "@mui/material";
import axios from "axios";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const URL = `${process.env.REACT_APP_SERVER_URL}/logout`;

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.post(URL, null, { withCredentials: true });
      console.log(res.data);
      navigate("/login");
      toast.success("Logged out!");
    } catch (error) {
      console.log(error.response.data.message);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <Link to="/upload">
        <Button variant="contained" color="secondary">
          Upload
        </Button>
      </Link>
      <Button variant="contained" color="secondary" onClick={handleLogout}>
        Logout
      </Button>
      <Link to="/scratch">
        <Button variant="contained" color="secondary">
          Scratch
        </Button>
      </Link>
    </div>
  );
};

export default Navbar;
