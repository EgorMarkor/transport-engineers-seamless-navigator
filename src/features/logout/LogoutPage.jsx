import {useEffect} from "react";
import {Navigate} from "react-router-dom";
import {useUser} from "shared/hooks/useUser";

const LogoutPage = () => {
  const {updateUser} = useUser();

  useEffect(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    updateUser();
  }, []);

  return <Navigate to="/"/>
};

export default LogoutPage;
