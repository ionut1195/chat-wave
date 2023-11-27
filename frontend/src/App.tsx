import "./App.css";
import LoginContextProvider from "./state/LoginContext";
import LoggedTemplate from "./state/LoggedTemplate";
import NotLoggedTemplate from "./state/NotLoggedTemplate";
import AuthenticationPage from "./features/AuthenticationPage/AuthenticationPage";
import { BrowserRouter as Router } from "react-router-dom";
import AllRoutes from "./routes";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SelectedConversationContext from "./state/SelectedConversationContext";

const theme = createTheme({
  palette: {
    primary: { main: "#00a884" },
  },
});
function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <LoginContextProvider>
          <LoggedTemplate>
            <SelectedConversationContext>
              <AllRoutes />
            </SelectedConversationContext>
          </LoggedTemplate>
          <NotLoggedTemplate>
            <AuthenticationPage />
          </NotLoggedTemplate>
        </LoginContextProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
