import React, { useState } from "react";
import { useDispatch } from "react-redux"; // Import useDispatch from Redux
import { login } from "../features/auth/authSlice"; // Import login action

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const dispatch = useDispatch(); // Initialize dispatch

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log("Attempting login with:", { email, password });

      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      console.log("Login response data:", data);

      if (response.ok) {
        console.log("Saving user to Redux store:", data.user);
        console.log("Dispatching login action with user:", data.user);
        dispatch(login(data.user));
        console.log("Login action dispatched.");
        localStorage.setItem("user", JSON.stringify(data.user)); // Save to localStorage for persistence
        window.location.href = "/";
      } else {
        setMessage(data.error);
        console.log("Login failed with error:", data.error);
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
