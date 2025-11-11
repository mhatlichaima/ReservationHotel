import React, { useState } from "react";
import axios from "axios";
import FaceCapture from "./FaceCapture";

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState("login"); // "login", "register", "faceLogin", "faceRegister"
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Connexion/inscription classique
 // Dans LoginModal.jsx - AMÉLIOREZ handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (mode === "login") {
      // Connexion normale
      const res = await axios.post("http://localhost:3001/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (res.data.success) {
        // Stocker les infos utilisateur
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        // Vérifier si le visage est déjà enregistré
        const faceCheck = await axios.get(
          `http://localhost:3001/api/face/check-face?email=${encodeURIComponent(formData.email)}`
        );

        if (!faceCheck.data.faceRegistered) {
          // Proposer l'enregistrement du visage
          if (confirm("Would you like to register face recognition for faster login?")) {
            setMode("faceRegister");
          } else {
            onClose();
            window.location.reload();
          }
        } else {
          onClose();
          window.location.reload();
        }
      }
    } else {
      // Inscription
      const res = await axios.post("http://localhost:3001/api/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: "user",
      });

      if (res.data.success) {
        // Stocker le token et user immédiatement
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        alert("✅ Account created! You can now add face recognition.");
        setMode("faceRegister");
      } else {
        alert(res.data.message);
      }
    }
  } catch (err) {
    console.error("Auth error:", err);
    alert(err.response?.data?.message || "Something went wrong. Please try again.");
  }
};
  // Enregistrement du visage
const handleFaceRegister = async (descriptor) => {
  try {
    // Récupérer le token et user du localStorage
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
      alert("Please login first before registering face.");
      setMode("login");
      return;
    }

    console.log("Registering face for user:", user._id); // Debug

    const res = await axios.post(
      "http://localhost:3001/api/face/register-face",
      {
        userId: user._id,
        faceDescriptor: descriptor,
      },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
    );

    if (res.data.success) {
      alert("✅ Face registered successfully! You can now login with face recognition.");
      onClose();
      window.location.reload();
    } else {
      alert(res.data.message || "Failed to register face.");
    }
  } catch (err) {
    console.error("Face registration error:", err);
    alert(err.response?.data?.message || "Failed to register face. Please try again.");
  }
};
  // Connexion par reconnaissance faciale
  const handleFaceLogin = async (descriptor) => {
    try {
      if (!formData.email) {
        alert("Please enter your email first.");
        return;
      }

      const res = await axios.post("http://localhost:3001/api/face/login-face", {
        email: formData.email,
        faceDescriptor: descriptor,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        alert("✅ Login successful!");
        onClose();
        window.location.reload();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Face login failed.");
    }
  };

const checkFaceRegistration = async () => {
  if (!formData.email) {
    alert("Please enter your email first.");
    return;
  }

  try {
    const res = await axios.get(
      `http://localhost:3001/api/face/check-face?email=${encodeURIComponent(formData.email)}`
    );

    console.log("Face check response:", res.data); // Debug

    if (res.data.success && res.data.faceRegistered) {
      setMode("faceLogin");
    } else {
      alert("Face not registered for this account. Please register your face first or use password login.");
    }
  } catch (err) {
    console.error("Check face registration error:", err);
    alert("Error checking face registration. Please try password login.");
  }
};

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-2xl my-8">
        {/* Title */}
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          {mode === "login" && "Login to QuickStay"}
          {mode === "register" && "Create your Account"}
          {mode === "faceLogin" && "Login with Face Recognition"}
          {mode === "faceRegister" && "Register Your Face"}
        </h2>

        {/* Formulaire classique */}
        {(mode === "login" || mode === "register") && (
          <>
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

            {/* Option de reconnaissance faciale */}
{mode === "login" && (
  <div className="mt-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="flex-1 border-t border-gray-300"></div>
      <span className="text-sm text-gray-500">OR</span>
      <div className="flex-1 border-t border-gray-300"></div>
    </div>
    
    <button
      type="button"
      onClick={checkFaceRegistration}
      className="w-full border-2 border-black text-black py-2.5 rounded-lg hover:bg-gray-50 transition mb-2"
    >
      🔒 Login with Face Recognition
    </button>

    <p className="text-xs text-center text-gray-500">
      Don't have face recognition?{" "}
      <button
        type="button"
        className="text-blue-600 hover:underline"
        onClick={async () => {
          if (!formData.email) {
            alert("Please enter your email first.");
            return;
          }
          // Se connecter d'abord puis proposer l'enregistrement
          try {
            const res = await axios.post("http://localhost:3001/api/auth/login", {
              email: formData.email,
              password: formData.password,
            });
            
            if (res.data.success) {
              localStorage.setItem("token", res.data.token);
              localStorage.setItem("user", JSON.stringify(res.data.user));
              setMode("faceRegister");
            }
          } catch (err) {
            alert("Please login first with your password.");
          }
        }}
      >
        Register your face after login
      </button>
    </p>
  </div>
)}

            {/* Toggle link */}
            <div className="mt-4 text-sm text-center text-gray-600">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
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
          </>
        )}

        {/* Capture faciale pour connexion */}
        {mode === "faceLogin" && (
          <div>
            <p className="text-center text-gray-600 mb-4">
              Position your face in the frame to login
            </p>
            <FaceCapture onFaceDetected={handleFaceLogin} mode="login" />
            <button
              onClick={() => setMode("login")}
              className="mt-4 text-sm text-gray-600 hover:underline w-full text-center"
            >
              ← Back to password login
            </button>
          </div>
        )}

        {/* Capture faciale pour enregistrement */}
        {mode === "faceRegister" && (
          <div>
            <p className="text-center text-gray-600 mb-4">
              Position your face in the frame to register
            </p>
            <FaceCapture onFaceDetected={handleFaceRegister} mode="register" />
            <button
              onClick={onClose}
              className="mt-4 text-sm text-gray-600 hover:underline w-full text-center"
            >
              Skip for now
            </button>
          </div>
        )}

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