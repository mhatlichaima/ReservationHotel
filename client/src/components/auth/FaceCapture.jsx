// FaceCapture.js - VERSION OPTIMISÉE
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

const FaceCapture = ({ onFaceDetected, mode = "login" }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [error, setError] = useState("");

  // Charger les modèles face-api
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        const MODEL_URL = "/models";
        
        console.log("📥 Loading face recognition models...");
        
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        
        setModelsLoaded(true);
        setIsLoading(false);
        console.log("✅ Models loaded successfully");
      } catch (err) {
        console.error("❌ Error loading models:", err);
        setError("Failed to load face recognition models. Please refresh the page.");
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  // Démarrer la webcam
  useEffect(() => {
    if (!modelsLoaded) return;

    const startVideo = async () => {
      try {
        console.log("🎥 Starting camera...");
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640, 
            height: 480,
            facingMode: "user" 
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        console.log("✅ Camera started");
      } catch (err) {
        console.error("❌ Error accessing webcam:", err);
        setError("Cannot access camera. Please allow camera permissions and make sure you have a webcam connected.");
      }
    };

    startVideo();

    return () => {
      // Nettoyer le stream
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        console.log("🛑 Camera stopped");
      }
    };
  }, [modelsLoaded]);

  // Détection en temps réel
  useEffect(() => {
    if (!modelsLoaded || error) return;

    let detectionInterval;

    const detectFace = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        return;
      }

      try {
        const detections = await faceapi
          .detectSingleFace(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detections) {
          setFaceDetected(true);
          
          // Dessiner les détections sur le canvas
          const canvas = canvasRef.current;
          if (canvas) {
            const displaySize = {
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight
            };
            faceapi.matchDimensions(canvas, displaySize);
            
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          }
        } else {
          setFaceDetected(false);
          // Effacer le canvas
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      } catch (err) {
        console.error("Detection error:", err);
      }
    };

    detectionInterval = setInterval(detectFace, 300); // Détection toutes les 300ms

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [modelsLoaded, error]);

  // Capturer le visage
  const captureFace = async () => {
    if (!videoRef.current || !faceDetected) {
      alert("Please wait until your face is detected properly.");
      return;
    }

    try {
      console.log("📸 Capturing face...");
      
      const detections = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        alert("No face detected. Please position your face in the frame and try again.");
        return;
      }

      // Extraire le descripteur facial
      const descriptor = Array.from(detections.descriptor);
      console.log("✅ Face captured, descriptor length:", descriptor.length);
      
      onFaceDetected(descriptor);
    } catch (err) {
      console.error("❌ Capture error:", err);
      alert("Failed to capture face. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">Camera Error</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Indicateur de statut */}
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${
          modelsLoaded ? (faceDetected ? "bg-green-500" : "bg-yellow-500") : "bg-gray-400"
        }`} />
        <span className="text-sm text-gray-600">
          {!modelsLoaded ? "Loading models..." : 
           faceDetected ? "Face detected ✅" : "Looking for face..."}
        </span>
      </div>

      {/* Zone de capture */}
      <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          width="640"
          height="480"
          autoPlay
          muted
          playsInline
          className="block"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-none"
          width="640"
          height="480"
        />
        
        {/* Overlay d'instructions */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
          {faceDetected 
            ? "✓ Face detected! Click the button below to capture."
            : "Position your face in the center of the frame"
          }
        </div>
      </div>

      {/* Bouton de capture */}
      <button
        onClick={captureFace}
        disabled={!faceDetected || !modelsLoaded}
        className={`px-8 py-3 rounded-lg font-medium text-white transition-all ${
          faceDetected && modelsLoaded
            ? "bg-green-600 hover:bg-green-700 shadow-lg"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {mode === "register" ? "📷 Register Face" : "🔓 Login with Face"}
      </button>

      {isLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
          <p className="text-gray-600 text-sm mt-2">Loading face recognition...</p>
        </div>
      )}
    </div>
  );
};

export default FaceCapture;