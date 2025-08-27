import "./App.css";
import PivotTable from "./pages/PivotTable";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import UploadFileForm from "./pages/UploadFileForm";
import Navbar from "./components/Navbar";
import Test from "./components/Test";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<UploadFileForm />} />
        <Route path="/scratch" element={<Test isEditMode={true} />} />
        <Route path="/view/:id" element={<PivotTable isEditMode={false} />} />
        <Route path="/edit/:id" element={<PivotTable isEditMode={true} />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
