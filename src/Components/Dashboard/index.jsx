import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../Services/Firebase";
import {
  doc,
  setDoc,
  Timestamp,
  collection,
  getDocs,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Button, Typography, Box } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCoffee,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import "./Styles.scss";

const Dashboard = () => {
  const [checkInTime, setCheckInTime] = useState(null);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [breakEndTime, setBreakEndTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Off Duty");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [shiftDuration, setShiftDuration] = useState(0); // Shift duration in minutes
  const [breakDuration, setBreakDuration] = useState(0); // Break duration in minutes
  const navigate = useNavigate();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchAttendanceData(user.uid);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (checkInTime && checkOutTime) {
      const shift = (checkOutTime.toDate() - checkInTime.toDate()) / 1000 / 60; // in minutes
      setShiftDuration(shift);
    }
    if (breakStartTime && breakEndTime) {
      const breakTime =
        (breakEndTime.toDate() - breakStartTime.toDate()) / 1000 / 60; // in minutes
      setBreakDuration(breakTime);
    }
  }, [checkInTime, checkOutTime, breakStartTime, breakEndTime]);

  const fetchAttendanceData = async (userId) => {
    const q = query(
      collection(db, "attendance"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const records = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push(data);
    });
    setAttendanceRecords(records);
  };

  const recordAction = async (actionType, description) => {
    const now = Timestamp.now();
    const docRef = doc(db, "attendance", userId);

    try {
      // Store action details in a separate collection "action_logs"
      await addDoc(collection(db, "action_logs"), {
        userId,
        actionType,
        description,
        timestamp: now,
      });

      // Update main attendance data with timestamp and action type
      const updates = { [actionType]: now };
      await setDoc(docRef, updates, { merge: true });

      // Set states for the UI to display the action time
      if (actionType === "checkIn") {
        setCheckInTime(now);
        setStatus("On Duty");
      } else if (actionType === "breakStart") {
        setBreakStartTime(now);
        setStatus("On Break");
      } else if (actionType === "breakEnd") {
        setBreakEndTime(now);
        setStatus("On Duty");
      } else if (actionType === "checkOut") {
        setCheckOutTime(now);
        setStatus("Off Duty");
      }

      // Update the attendance records UI with the new action
      const newRecord = { description, timestamp: now };
      setAttendanceRecords((prevRecords) => [...prevRecords, newRecord]);
    } catch (err) {
      setError("Failed to record action. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      setError("Failed to log out. Please try again.");
    }
  };

  // Format the time in the format: '3:30 PM'
  const formatDateTime = (timestamp) => {
    if (!timestamp) return ""; // If no timestamp is set, show nothing
    const date = timestamp.toDate();
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard">
      <header className="header">
        <Typography variant="h4" color="primary">
          Driver Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary" className="datetime">
          {new Date().toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </Typography>
      </header>
      <Box className="status-indicator">
        <div
          className={`status-card ${
            status === "On Duty"
              ? "on-duty"
              : status === "On Break"
              ? "on-break"
              : "off-duty"
          }`}
        >
          <FontAwesomeIcon
            icon={
              status === "On Duty"
                ? faCheckCircle
                : status === "On Break"
                ? faCoffee
                : faTimesCircle
            }
            className="status-icon"
          />
          <div className="status-label">{status}</div>
          <div className="status-description">
            {status === "On Duty"
              ? "Currently working"
              : status === "On Break"
              ? "Taking a short break"
              : "Not logged in"}
          </div>
        </div>
      </Box>

      <Box className="actions">
        <Button
          variant="contained"
          color="primary"
          onClick={() => recordAction("checkIn", "Check-in")}
          disabled={status !== "Off Duty"}
        >
          Check In
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => recordAction("breakStart", "Break Start")}
          disabled={status !== "On Duty"}
        >
          Start Break
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => recordAction("breakEnd", "Break End")}
          disabled={status !== "On Break"}
        >
          End Break
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => recordAction("checkOut", "Check-out")}
          disabled={status !== "On Duty"}
        >
          Check Out
        </Button>
      </Box>

      <div className="attendance-records">
        <Typography variant="h6" color="primary" gutterBottom>
          Attendance Records
        </Typography>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Action</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((record, index) => (
              <tr key={index}>
                <td>{formatDate(record.timestamp)}</td>
                <td>{record.description}</td>
                <td>{formatDateTime(record.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
      <Button variant="contained" color="secondary" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};

export default Dashboard;
