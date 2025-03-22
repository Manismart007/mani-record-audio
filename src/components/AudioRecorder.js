import { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop, FaPlay, FaUpload, FaTrash, FaPause } from "react-icons/fa";
import { uploadAudio } from "./Storage";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [timer, setTimer] = useState(0);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const intervalRef = useRef(null);

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
    }
  };

  const stopRecording = () => {
    if (recording) {
      mediaRecorder.current.stop();
      setRecording(false);
      setPaused(false);
    }
  };

  const clearAudio = () => {
    setAudioUrl(null);
    setTimer(0);
    setPaused(false);
    toast.info("Audio cleared");
  };

  return (
    <div className="container mt-5">
      <div className="text-center">
        <div
          className={`mb-3 ${recording || paused ? "animate__animated animate__pulse" : ""}`}
          style={{ fontSize: "50px", color: recording ? "red" : "green" }}
        >
          {recording ? <FaPause /> : <FaMicrophone />}
        </div>
        <p className="lead">Recording Time: {timer}s</p>
        <div className="btn-group" role="group">
          <button
            onClick={toggleRecording}
            className={`btn ${recording ? "btn-danger" : "btn-success"} btn-lg`}
          >
            {recording ? (paused ? <FaPlay /> : <FaPause />) : <FaMicrophone />}{" "}
            {recording ? (paused ? "Resume" : "Pause") : "Record"}
          </button>
          {recording && (
            <button
              onClick={stopRecording}
              className="btn btn-warning btn-lg ms-3"
            >
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
      </div>
      <ToastContainer />
    </div>
  );
}
