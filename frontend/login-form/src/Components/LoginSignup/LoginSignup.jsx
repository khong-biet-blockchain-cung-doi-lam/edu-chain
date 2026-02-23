import React, { useState } from "react";
import "./LoginSignup.css";

import user_icon from "../Assets/person.png";
import logo_neu from "../Assets/Logo-NEU.png";
import password_icon from "../Assets/password.png";

import { login } from "../../api/api";

const LoginSignup = () => {
  const [action, setAction] = useState("Login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAction = async (clickedAction) => {
    if (clickedAction === "Sign Up") {
      alert("Chức năng đăng ký đang được phát triển.");
      return;
    }

    if (action === "Sign Up" && clickedAction === "Login") {
      setAction("Login");
      return;
    }

    // Process Login
    setErrorMsg("");
    try {
      const data = await login(username, password);
      
      if (data.access_token) {
        const role = data.user.role;
        const token = data.access_token;
        const userData = encodeURIComponent(JSON.stringify({ ...data.user, fullName: data.user.username })); // Ensure fullName exists so admin bar doesn't error out

        // Cổng chia luồng (SSO Router)
        if (role === "QL_DAO_TAO") {
          window.location.href = `http://localhost:5004/?token=${token}&userData=${userData}`;
        } else if (role === "PARTNER") {
          window.location.href = `http://localhost:5003/?token=${token}&userData=${userData}`;
        } else if (role === "SINH_VIEN") {
          window.location.href = `http://localhost:5005/?token=${token}&userData=${userData}`;
        } else if (role === "GIANG_VIEN") {
          window.location.href = `http://localhost:5006/?token=${token}&userData=${userData}`;
        } else {
           alert("Đăng nhập thành công nhưng chưa có portal cho quyền này!");
        }
      } else {
        setErrorMsg(data.msg || "Tên đăng nhập hoặc mật khẩu không đúng.");
      }
    } catch (err) {
      setErrorMsg("Không thể kết nối tới máy chủ.");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>
      <div className="logo">
        <img src={logo_neu} alt="NEU Logo" />
      </div>
      
      {errorMsg && <div style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>{errorMsg}</div>}

      <div className="inputs">
        <div className="input">
          <img src={user_icon} alt="User" />
          <input 
            type="text" 
            placeholder="Tên đăng nhập hoặc Email" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input">
          <img src={password_icon} alt="Password" />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAction("Login");
              }
            }}
          />
        </div>
      </div>
      <div className="forgot-password">
        Quên mật khẩu? <span>Nhấn vào đây!</span>
      </div>
      <div className="submit-container">
        <div
          className={action === "Login" ? "submit gray" : "submit"}
          onClick={() => handleAction("Sign Up")}
        >
          Sign Up
        </div>
        <div
          className={action === "Sign Up" ? "submit gray" : "submit"}
          onClick={() => handleAction("Login")}
        >
          Login
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
