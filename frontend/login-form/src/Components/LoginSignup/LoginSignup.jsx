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
        const userData = encodeURIComponent(JSON.stringify({ ...data.user, fullName: data.user.username }));

        // Cổng chia luồng (SSO Router)
        const roleNormalized = role.toUpperCase();
        const ADMIN_ROLES = ["ADMIN", "QL_DAO_TAO", "KHAO_THI", "KHOA", "STAFF", "staff"];

        if (ADMIN_ROLES.includes(roleNormalized)) {
          window.location.href = `http://localhost:5004/?token=${token}&userData=${userData}`;
        } else if (roleNormalized === "PARTNER") {
          window.location.href = `http://localhost:5003/?token=${token}&userData=${userData}`;
        } else if (roleNormalized === "SINH_VIEN" || role === "student") {
          window.location.href = `http://localhost:5005/?token=${token}&userData=${userData}`;
        } else if (roleNormalized === "GIANG_VIEN" || role === "lecturer") {
          window.location.href = `http://localhost:5006/?token=${token}&userData=${userData}`;
        } else {
          alert("Đăng nhập thành công nhưng chưa có portal cho quyền này: " + role);
        }

      } else {
        setErrorMsg(data.msg || "Tên đăng nhập hoặc mật khẩu không đúng.");
      }
    } catch (err) {
      setErrorMsg("Không thể kết nối tới máy chủ.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-branding">
          <img src={logo_neu} alt="NEU Logo" className="login-logo-img" />
          <h1>EDU-CHAIN</h1>
          <p>Hệ thống quản lý đào tạo và chứng chỉ trên nền tảng Blockchain - Đại học Kinh tế Quốc dân</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-header">
          <h2>Đăng nhập</h2>
          <div className="subtitle">Chào mừng bạn quay trở lại. Hãy đăng nhập để tiếp tục.</div>
        </div>

        {errorMsg && <div className="error-msg">{errorMsg}</div>}

        <div className="inputs-group">
          <div className="input-field">
            <label>Tên đăng nhập</label>
            <div className="input-wrapper">
              <img src={user_icon} alt="User" />
              <input
                type="text"
                placeholder="Tên đăng nhập hoặc Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="input-field">
            <label>Mật khẩu</label>
            <div className="input-wrapper">
              <img src={password_icon} alt="Password" />
              <input
                type="password"
                placeholder="••••••••"
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
        </div>

        <div className="forgot-link">
          <span>Quên mật khẩu?</span>
        </div>

        <div className="actions">
          <button
            className="btn-submit btn-login"
            onClick={() => handleAction("Login")}
          >
            Đăng nhập
          </button>
          <button
            className="btn-submit btn-signup"
            onClick={() => handleAction("Sign Up")}
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
