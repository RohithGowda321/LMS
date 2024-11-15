import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../Services/Firebase";
import "./Styles.scss";
import Loader from "../../../Components/Loaders";

import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";

const Login = ({ setLoading }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [role, setRole] = useState(""); // to store selected role (Driver/Admin)
  const [roleError, setRoleError] = useState(""); // to store error if no role selected
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRoleError(""); // Reset role error

    if (!role) {
      setRoleError("Please select either Driver or Admin.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form">
      <div className="form-header">
        <h2>LOGIN</h2>
        <div className="role-selection">
          <label className="role-label">Role:</label>
          <div className="role-options">
            <div className="radio-option">
              <input
                type="radio"
                id="driver"
                name="role"
                value="driver"
                checked={role === "driver"}
                onChange={() => setRole("driver")}
              />
              <label htmlFor="driver">Driver</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="admin"
                name="role"
                value="admin"
                checked={role === "admin"}
                onChange={() => setRole("admin")}
              />
              <label htmlFor="admin">Admin</label>
            </div>
          </div>
        </div>
      </div>
      {roleError && <div className="role-error">{roleError}</div>}

      <div className="flex-column">
        <label>Email</label>
      </div>
      <div className="inputForm">
        <EmailIcon style={{ color: "#9e9e9e" }} />
        <input
          type="text"
          className="input"
          placeholder="Enter your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex-column">
        <label>Password</label>
      </div>
      <div className="inputForm">
        <LockIcon style={{ color: "#9e9e9e" }} />
        <input
          type="password"
          className="input"
          placeholder="Enter your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex-row">
        <span className="span">Forgot password?</span>
      </div>
      {error && <p className="error-message">{error}</p>}
      <button className="button-submit" onClick={handleSubmit}>
        Sign In
      </button>
      <p className="p">
        Don't have an account?{" "}
        <span
          className="span"
          style={{
            color: "blue",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => navigate("/sign-up")}
        >
          Sign Up
        </span>
      </p>

      <div className="flex-row">
        <button className="btn google">
          <GoogleIcon />
          Google
        </button>
      </div>
    </form>
  );
};

export default Loader(Login);
