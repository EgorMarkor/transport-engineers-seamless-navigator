import ReactDOM from 'react-dom/client';
import {BrowserRouter} from "react-router-dom";
import App from './App';
import {UserProvider} from "./shared/hooks/useUser.js";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UserProvider>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </UserProvider>
);
