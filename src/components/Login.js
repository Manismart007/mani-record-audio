import { useState } from "react";
import { signIn } from "aws-amplify/auth";
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      console.log("Logging in with:", email);
      const response = await signIn({ username: email, password });
      console.log("Login successful:", response);
      window.location.reload();
      toast.success("Login Successfully!");
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Login failed");
    }
  };

  const handleNavigateToSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "22rem" }}>
        <h2 className="text-center mb-3">Login</h2>
        {error && <p className="text-danger text-center">{error}</p>}

        <div className="mb-3">
          <label className="form-label">Email / UserName</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn btn-primary w-100" onClick={handleLogin}>
          Login
        </button>

        <p className="text-center mt-3">
          Don't have an account?{" "}
          <span
            className="text-primary"
            style={{ cursor: "pointer" }}
            onClick={handleNavigateToSignUp}
          >
            Create New Account
          </span>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;


