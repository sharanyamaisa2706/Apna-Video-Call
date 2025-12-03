import React, { useState, useContext } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import "../utils/App.css"; 
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../context/AuthContext';

function HomeComponent() {

  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory } = useContext(AuthContext);

  // Make sure this function is defined BEFORE it is used in JSX
  const handleJoinVideoCall = async () => {
    if (!meetingCode) return alert("Enter meeting code!");
    await addToUserHistory(meetingCode);  // saves to history
    navigate(`/${meetingCode}`);
  };

  return (
    <>
      <div className="navBar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>Apna Video Call</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={
            ()=>{
              navigate("/history")
            }
          }>
            <RestoreIcon />
            <p>History</p>
          </IconButton>

          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <h2>Providing Quality Video Call Just Like Quality Education</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <TextField
              onChange={e => setMeetingCode(e.target.value)}
              value={meetingCode}
              id="outlined-basic"
              variant="outlined"
              placeholder="Enter meeting code"
            />
            <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>
          </div>
        </div>

        <div className="rightPanel">
          <img srcSet='./logo4.png' alt="Logo" style={{ width: "100%", height: "100%" }} />
        </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);
