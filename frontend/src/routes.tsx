import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout/Layout";
import LogoutPage from "./features/LogoutPage";
import ConversationPage from "./features/ConversationPage/ConversationPage";
import { CONVERSATIONS_BASE_PATH } from "./utils/routes";
import AboutPage from "./features/AboutPage/AboutPage";

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout children={<AboutPage />} />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route
        path={`${CONVERSATIONS_BASE_PATH}/:id`}
        element={
          <MainLayout>
            <ConversationPage />
          </MainLayout>
        }
      />
    </Routes>
  );
};

export default AllRoutes;
