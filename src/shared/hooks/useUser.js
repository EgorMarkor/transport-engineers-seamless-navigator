import {createContext, useContext, useEffect, useState} from "react";
import Api from "api.js";

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({children}) => {
  const [user, setUser] = useState(null);

  const updateUser = () => {
    Api.get("/profile")
      .then(response => setUser(response.data))
      .catch(() => setUser(null));
  };

  useEffect(() => {
    updateUser();
  }, []);

  return <UserContext.Provider value={{user, updateUser}}>
    {children}
  </UserContext.Provider>;
}