import "./styles/App.css";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import { Profile } from "./components/ProfileView/Profile";
import SettingUpPDF from "./components/UploadDocument/SettingUpPDF";
import FindAllDocumentsToSign from "./components//SignaturesRequired/FindAllDocumentsToSign";
import RejectDocument from "./components//SignaturesRequired/RejectDocument";
import ViewDocument from "./components//SignaturesRequired/ViewDocument";
import SendToBucketAndUser from "./components/UploadDocument/SendToBucketAndUser";
import TimeToSign from "./components//SignaturesRequired/TimeToSign";
import AllDocumentsSentOrSigned from "./components/DocumentHistory/AllDocumentsSentOrSigned"
import SentSuccessfully from "./components/UploadDocument/SentSuccessfully"
import React, { useState, useContext, useEffect } from "react";
import AuthApi from "./AuthApi";
import Cookies from "js-cookie";


function App() {
  const [auth, setAuth] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState("");

  const readCookie = () => {
    const user = Cookies.get("user");
    if (user) {
      setAuth(true);
    }
  };

  useEffect(() => {
    readCookie();
  }, []);

  return (
    <div className="App">
      <AuthApi.Provider
        value={{ auth, setAuth, loggedInUser, setLoggedInUser }}
      >
        <Router>
          <Switch>
            <Routes />
          </Switch>
        </Router>
      </AuthApi.Provider>
    </div>
  );
}

const Routes = () => {
  const Auth = useContext(AuthApi);
  return (
    <div>
      <ProtectedLogin path="/" exact auth={Auth.auth} component={Login} />
      <ProtectedLogin path="/signup" auth={Auth.auth} component={Signup} />
      <ProtectedRoute path="/nav" auth={Auth.auth} component={Navbar} />
      <ProtectedRoute
        path="/nav/dashboard"
        auth={Auth.auth}
        component={Dashboard}
      />
      <ProtectedRoute
        path="/nav/profile"
        auth={Auth.auth}
        component={Profile}
      />
      <ProtectedRoute
        path="/nav/viewer"
        exact
        auth={Auth.auth}
        component={SettingUpPDF}
      />
      <ProtectedRoute path="/nav/viewer/sent" auth={Auth.auth} component={SendToBucketAndUser} />
      <ProtectedRoute path="/nav/signdocuments" auth={Auth.auth} exact component={FindAllDocumentsToSign} />
      <ProtectedRoute path="/nav/signdocuments/signaturetime" auth={Auth.auth} component={TimeToSign} />
      <ProtectedRoute path="/nav/signdocuments/viewdocument" auth={Auth.auth} component={ViewDocument} />
      <ProtectedRoute path="/nav/managedocs" auth={Auth.auth} component={AllDocumentsSentOrSigned} />
      <ProtectedRoute path="/nav/signdocuments/rejectdocument" auth={Auth.auth} component={RejectDocument} />
      <ProtectedRoute path="/nav/signdocuments/sentsuccess" auth={Auth.auth} component={SentSuccessfully} />
    </div>
  );
};

const ProtectedRoute = ({ auth, component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => (auth ? <Component /> : <Redirect to="/" />)}
    />
  );
};

const ProtectedLogin = ({ auth, component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        !auth ? <Component {...props} /> : <Redirect to="/nav/dashboard" />
      }
    />
  );
};


export default App;
