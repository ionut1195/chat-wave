import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import LogoutPage from "./features/LogoutPage";

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout children={<>TEST</>} />} />
      <Route path="/logout" element={<LogoutPage />} />
    </Routes>
  );
};

export default AllRoutes;
