import React, { useState } from "react";
import { useDispatch } from "react-redux"; // Import useDispatch from Redux
import { login } from "../features/auth/authSlice"; // Import login action
import { baseURL } from "../config";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const dispatch = useDispatch(); // Initialize dispatch

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${baseURL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        dispatch(login(data.user));
        localStorage.setItem("user", JSON.stringify(data.user)); // Save to localStorage for persistence
        window.location.href = "/";
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Error during login. Please try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default LoginForm;
