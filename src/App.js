import {useEffect} from "react";
import {Route, Routes} from "react-router-dom";
import Navbar from "./features/navbar/Navbar";
import MainPage from "./features/main-page/MainPage";
import SignupPage from "./features/signup/SignupPage";
import MapEditor from "./features/map-editor/MapEditor";
import LogoutPage from "./features/logout/LogoutPage";
import LoginPage from "./features/login/LoginPage";
import "./index.css";

const App = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return <>
    <Navbar/>

    <Routes>
      <Route path="/" element={<MainPage/>}/>
      <Route path="/signup" element={<SignupPage/>}/>
      <Route path="/create-map" element={<MapEditor/>}/>
      <Route path="/logout" element={<LogoutPage/>}/>
      <Route path="/login" element={<LoginPage/>}/>
    </Routes>
  </>;
}

export default App;