import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const URL = `${process.env.REACT_APP_SERVER_URL}/login`;

const Login = () => {
  const [user, setUser] = useState({
    name: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(URL, user, { withCredentials: true });
      navigate("/");
      toast.success("Logged in!")
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form onSubmit={handleClick}>
      <input type="email" name="email" onChange={handleChange} />
      <input type="password" name="password" onChange={handleChange} />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
