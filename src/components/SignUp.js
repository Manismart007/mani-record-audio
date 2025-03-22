import React, { useState } from "react";
import { Amplify } from "aws-amplify";
import { signUp, confirmSignUp } from "@aws-amplify/auth";
import awsConfig from "../aws-exports";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

Amplify.configure(awsConfig);

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    otp: "",
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    navigate("/");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async () => {
    try {
      console.log("Signing up:", formData);
      await signUp({
        username: formData.username,
        password: formData.password,
        options: { userAttributes: { email: formData.email } },
      });
      toast.success("Sign-up successful! Enter OTP to verify.");
      setStep(2);
      setError("");
    } catch (error) {
      console.error("Error signing up:", error);
      setError(error.message);
    }
  };

  const handleConfirmSignUp = async () => {
    try {
      await confirmSignUp({
        username: formData.username,
        confirmationCode: formData.otp,
      });
      toast.success("User confirmed successfully!");
      setStep(3);
      setError("");
      navigate("/");
    } catch (error) {
      console.error("Error confirming sign-up:", error);
      setError(error.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "22rem" }}>
        <h2 className="text-center mb-3">
          {step === 1 ? "Sign Up" : step === 2 ? "Enter OTP" : "Success"}
        </h2>

        {error && <p className="text-danger text-center">{error}</p>}

        {step === 1 && (
          <>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="Enter username"
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter email"
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter password"
                onChange={handleChange}
              />
            </div>

            <button className="btn btn-primary w-100" onClick={handleSignUp}>
              Sign Up
            </button>

            <p className="text-center mt-3">
              Already have an account?{" "}
              <span
                className="text-primary"
                style={{ cursor: "pointer" }}
                onClick={handleNavigateToLogin}
              >
                Login
              </span>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-3">
              <label className="form-label">Enter OTP</label>
              <input
                type="text"
                name="otp"
                className="form-control"
                placeholder="Enter OTP"
                onChange={handleChange}
              />
            </div>

            <button
              className="btn btn-success w-100"
              onClick={handleConfirmSignUp}
            >
              Verify
            </button>
          </>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Signup;

