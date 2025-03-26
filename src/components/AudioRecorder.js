import { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop, FaPlay, FaUpload, FaTrash, FaPause } from "react-icons/fa";
import { uploadAudio } from "./Storage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [timer, setTimer] = useState(0);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (recording && !paused) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [recording, paused]);

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const draw = () => {
      requestAnimationFrame(draw);
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#00ff00";
      ctx.beginPath();

      let sliceWidth = (WIDTH * 1.0) / dataArrayRef.current.length;
      let x = 0;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        let v = dataArrayRef.current[i] / 128.0;
        let y = (v * HEIGHT) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(WIDTH, HEIGHT / 2);
      ctx.stroke();
    };

    draw();
  };

  const startVisualizer = (stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current.fftSize = 2048;

    dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    sourceRef.current.connect(analyserRef.current);
    drawWaveform();
  };

  const toggleRecording = async () => {
    if (recording) {
      if (paused) {
        mediaRecorder.current.resume();
        setPaused(false);
        toast.info("Recording resumed");
      } else {
        mediaRecorder.current.pause();
        setPaused(true);
        toast.info("Recording paused");
      }
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        setAudioUrl(URL.createObjectURL(audioBlob));
        setTimer(0);
        toast.success("Recording stopped");
      };

      mediaRecorder.current.start();
      setRecording(true);
      setPaused(false);
      toast.success("Recording started");
      startVisualizer(stream);
    }
  };

  const stopRecording = () => {
    if (recording) {
      mediaRecorder.current.stop();
      setRecording(false);
      setPaused(false);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  const clearAudio = () => {
    setAudioUrl(null);
    setTimer(0);
    setPaused(false);
    toast.info("Audio cleared");
  
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().then(() => {
          audioContextRef.current = null;
        });
      } else {
        audioContextRef.current = null;
      }
    }
  };  

  return (
    <div className="container mt-5 text-center">
<div className="d-flex justify-content-center align-items-center">
  <div className="col-12 col-md-8 col-lg-6">
    <canvas ref={canvasRef} className="border rounded shadow w-100" style={{ height: "100px" }}></canvas>
  </div>
</div>


      <p className="lead">Recording Time: {timer}s</p>
      <div className="btn-group" role="group">
        <button onClick={toggleRecording} className={`btn ${recording ? "btn-danger" : "btn-success"} btn-lg`}>
          {recording ? (paused ? <FaPlay /> : <FaPause />) : <FaMicrophone />}{" "}
          {recording ? (paused ? "Resume" : "Pause") : "Record"}
        </button>
        {recording && (
          <button onClick={stopRecording} className="btn btn-warning btn-lg ms-3">
            <FaStop /> Stop
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="mt-4">
          <audio controls src={audioUrl} className="w-100" />
          <div className="mt-3">
            <button onClick={() => uploadAudio(audioUrl)} className="btn btn-primary btn-lg me-3">
              <FaUpload /> Upload
            </button>
            <button onClick={clearAudio} className="btn btn-danger btn-lg">
              <FaTrash /> Clear
            </button>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

