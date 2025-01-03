import React, {createContext, useContext, useEffect, useState} from "react";
import Api from "api";

export interface User {
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  updateUser: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within an UserProvider")
  }

  return context;
}

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider = ({children}: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const updateUser = () => {
    Api.get("/profile")
      .then(response => setUser(response.data))
      .catch(() => setUser(null));
  };

  useEffect(() => {
    updateUser();
  }, []);

  return (
    <UserContext.Provider value={{user, updateUser}}>
      {children}
    </UserContext.Provider>
  );
}