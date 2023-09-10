import "./App.css";
import { useMemo, useState } from "react";
import LoginContextProvider from "./state/LoginContext";
import LoggedTemplate from "./state/LoggedTemplate";
import NotLoggedTemplate from "./state/NotLoggedTemplate";
import RegisterForm from "./features/RegisterForm/RegisterForm";
import { useRecoilValue } from "recoil";
import { currentUserState } from "./state/recoil/atoms/CurrentUser";
import AuthenticationPage from "./features/AuthenticationPage/components/AuthenticationPage";
import { BrowserRouter as Router } from "react-router-dom";
import AllRoutes from "./routes";
function App() {
  const user = useRecoilValue(currentUserState);
  console.log(user);
  // const socket = useMemo(() => new WebSocket("ws://localhost:8000/ws"), []);
  // const [files, setFiles] = useState<File[]>([]);
  // const [message, setMessage] = useState("");
  // socket.onopen = () => {
  //   console.log("WebSocket connection established");
  // };

  // socket.onclose = () => {
  //   console.log("WebSocket connection closed");
  // };

  // socket.onerror = (error) => {
  //   console.error("WebSocket error:", error);
  // };

  // socket.onmessage = (message) => {
  //   console.log(`received message from server: ${message}`);
  // };
  // console.log(process.env.REACT_APP_TEST);
  // console.log(files);
  // function fileToBase64(file: File): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve((reader.result as string).split(",")[1]);
  //     reader.onerror = (error) => reject(error);
  //   });
  // }
  // const handleSendFile = async () => {
  //   const base64Files: { filename: string; content: string }[] = [];
  //   try {
  //     for (let i = 0; i < files.length; i++) {
  //       const encriptedFile = await fileToBase64(files[i]);
  //       base64Files.push({ filename: files[i].name, content: encriptedFile });
  //     }
  //     const messageData = {
  //       id: "testId",
  //       message: message,
  //       files: base64Files,
  //     };
  //     socket.send(JSON.stringify(messageData));
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  return (
    <LoginContextProvider>
      <LoggedTemplate>
        <Router>
          <AllRoutes />
        </Router>

        {/* <>
          <header
            className="bg-yellow-300"
            onClick={() => {
              socket.send(
                JSON.stringify({
                  id: "test",
                  message: "yoloooo",
                  file: btoa("testing"),
                })
              );
            }}
          >
            TESTing
          </header>
          <input
            multiple
            type="file"
            onChange={(e) => {
              if (e.target.files?.length) {
                setFiles(Array.from(e.target.files));
              }
            }}
          />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={handleSendFile}>send</button>
        </> */}
      </LoggedTemplate>
      <NotLoggedTemplate>
        {/* <LoginForm /> */}
        <AuthenticationPage />
      </NotLoggedTemplate>
    </LoginContextProvider>
  );
}

export default App;
