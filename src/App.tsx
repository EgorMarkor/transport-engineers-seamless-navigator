import React, {useEffect} from "react";
import {Route, Routes} from "react-router-dom";
import Navbar from "./features/navbar/Navbar";
import MainPage from "./features/main-page/MainPage";
import SignupPage from "./features/signup/SignupPage";
import LogoutPage from "./features/logout/LogoutPage";
import LoginPage from "./features/login/LoginPage";
import CreateMapPage from "./features/create-map-page/CreateMapPage";
import "./index.css";

const App: React.FC = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return <>
    <Navbar/>

    <Routes>
      <Route path="/" element={<MainPage/>}/>
      <Route path="/signup" element={<SignupPage/>}/>
      <Route path="/logout" element={<LogoutPage/>}/>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/create-map" element={<CreateMapPage/>}/>
    </Routes>
  </>;
}

export default App;