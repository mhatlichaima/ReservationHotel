import React, { useState } from "react";
import axios from "axios";

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ handle both login and register
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        await onLogin(formData.email, formData.password);
      } else {
        const res = await axios.post("http://localhost:3001/api/auth/register", {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: "user", // or "hotelOwner"
        });

        if (res.data.success) {
          alert("✅ Account created successfully! You can now log in.");
          setMode("login");
          setFormData({ username: "", email: "", password: "" });
        } else {
          alert(res.data.message);
        }
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md">
        {/* Title */}
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          {mode === "login" ? "Login to QuickStay" : "Create your Account"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "register" && (
            <input
              type="text"
              name="username"
              placeholder="Full Name"
              value={formData.username}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
            required
          />

          <button
            type="submit"
            className="bg-black text-white py-2.5 rounded-lg hover:bg-gray-800 transition"
          >
            {mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Toggle link */}
        <div className="mt-4 text-sm text-center text-gray-600">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                className="text-black font-medium hover:underline"
                onClick={() => setMode("register")}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="text-black font-medium hover:underline"
                onClick={() => setMode("login")}
              >
                Login
              </button>
            </>
          )}
        </div>

        <button
          className="mt-4 text-sm text-gray-500 hover:underline w-full text-center"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
