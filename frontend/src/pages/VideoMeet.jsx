import React, { useState, useRef, useEffect } from 'react';
import { io } from "socket.io-client";
import Button from '@mui/material/Button';
import {Badge, IconButton ,TextField} from '@mui/material';
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from 'react-router-dom';
import styles from "../style/VideoComponent.module.css";

const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

export default function VideoMeetComponent() {
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef();

    let [videoAvailable, setVideoAvaiable] = useState(true);
    let [audioAvailable, setAudioAvaiable] = useState(true);
    let [video, setVideo] = useState();
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(true);
    let [screenAvailable, setScreenAvaibale] = useState();
    let [messages, setMessages] = useState([]);
    let [messageInput, setMessageInput] = useState(""); // NEW: input text state
    let [newMessages, setNewMessages] = useState(3);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");

    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            setVideoAvaiable(!!videoPermission);

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioAvaiable(!!audioPermission);

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvaibale(true);
            } else {
                setScreenAvaibale(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({
                    video: videoAvailable,
                    audio: audioAvailable
                });

                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }

        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getPermissions();
    }, []);

    let getUserMediaSuccess = (stream) => {
        try {
            if (window.localStream && window.localStream.getTracks) {
                window.localStream.getTracks().forEach(track => {
                    try { track.stop(); } catch (e) { }
                });
            }
        } catch (e) {
            console.log(e);
        }

        window.localStream = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            try {
                if (connections[id].addStream && window.localStream) {
                    connections[id].addStream(window.localStream);
                }
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            if (socketRef.current) {
                                socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
                            }
                        }).catch(e => console.log(e));
                }).catch(e => console.log(e));
            } catch (e) { console.log(e); }
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => {
                    try { track.stop(); } catch (e) { }
                });
            } catch (e) { console.log(e); }

            let blackSilence = () => new MediaStream([black().getVideoTracks()[0], silence().getAudioTracks()[0]]);
            window.localStream = blackSilence();
            if (localVideoRef.current) localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {
                try {
                    if (connections[id].addStream) {
                        connections[id].addStream(window.localStream);
                    }
                    connections[id].createOffer().then((description) => {
                        connections[id].setLocalDescription(description)
                            .then(() => {
                                if (socketRef.current) {
                                    socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
                                }
                            }).catch(e => console.log(e));
                    }).catch(e => console.log(e));
                } catch (e) { console.log(e); }
            }
        });
    };

    let silence = () => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return dst.stream;
    };

    let black = ({ width = 640, height = 480 } = {}) => {
        const canvas = Object.assign(document.createElement("canvas"), { width, height });
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);
        return canvas.captureStream();
    };

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then(() => { })
                .catch((err) => console.log(err));
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { }
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [audio, video]);

    let gotMessageFromServer = (fromId, message) => {
        try {
            var signal = typeof message === "string" ? JSON.parse(message) : message;

            if (fromId !== socketIdRef.current) {
                if (signal.sdp) {
                    if (!connections[fromId]) {
                        connections[fromId] = new RTCPeerConnection(peerConfigConnections);

                        connections[fromId].onicecandidate = (event) => {
                            if (event.candidate && socketRef.current) {
                                socketRef.current.emit("signal", fromId, JSON.stringify({ 'ice': event.candidate }));
                            }
                        };

                        connections[fromId].ontrack = (ev) => {
                            const remoteStream = ev.streams[0];
                            setVideos(prevVideos => {
                                if (prevVideos.find(v => v.socketId === fromId)) return prevVideos;
                                return [...prevVideos, { socketId: fromId, stream: remoteStream, autoPlay: true, playsInline: true }];
                            });
                        };
                    }

                    connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                        if (signal.sdp.type === "offer") {
                            connections[fromId].createAnswer().then((description) => {
                                connections[fromId].setLocalDescription(description).then(() => {
                                    if (socketRef.current) {
                                        socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }));
                                    }
                                }).catch(e => console.log(e));
                            }).catch(e => console.log(e));
                        }
                    }).catch(e => console.log(e));
                }
                if (signal.ice) {
                    connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
                }
            }
        } catch (e) {
            console.log("gotMessageFromServer error:", e);
        }
    };

    let addMessage = (data, sender, socketIdSender) => { 
        setMessages((prevMessages)=>[
            ...prevMessages,
            {sender: sender, data: data}
        ]);
    };

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });

        socketRef.current.on("signal", gotMessageFromServer);
        socketRef.current.on("connect", () => {

            socketRef.current.emit("join-call", window.location.href);

            socketIdRef.current = socketRef.current.id;

            socketRef.current.on("chat-message", addMessage);

            socketRef.current.on("user-left", (id) => {
                setVideos((videos) => videos.filter((v) => v.socketId !== id));
            });

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {

                    if (socketListId === socketIdRef.current) return; 
                    if (connections[socketListId]) return; 

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate != null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };

                    connections[socketListId].ontrack = (event) => {
                        const remoteStream = event.streams[0];
                        setVideos(prevVideos => {
                            if (prevVideos.find(v => v.socketId === socketListId)) return prevVideos;
                            return [...prevVideos, { socketId: socketListId, stream: remoteStream, autoPlay: true, playsInline: true }];
                        });
                    };

                    if (window.localStream) {
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    }

                    if (id === socketIdRef.current) {
                        connections[socketListId].createOffer().then(description => {
                            connections[socketListId].setLocalDescription(description).then(() => {
                                socketRef.current.emit("signal", socketListId, JSON.stringify({ sdp: connections[socketListId].localDescription }));
                            });
                        });
                    }

                });
            });

        });
    };

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
    };

    let routerTo = useNavigate();

    const connect = () => {
        setAskForUsername(false);
        getMedia();
        connectToSocketServer();
    };
    
    let handleVideo = () =>{
        setVideo(!video);
    };

    let handleAudio = () =>{
        setAudio(!audio)
    }

    let handleScreen = ()=>{
        setScreen(!screen)
    }

    const sendMessages = () => {
        if (socketRef.current && messageInput.trim() !== "") {
            socketRef.current.emit("chat-message", messageInput, username);
            setMessageInput("");
        }
    };

    let handleEndCall = ()=>{
        try{
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track=>track.stop())
        }catch(e) {}

        routerTo("/home")
    }

    // Render
    return (
        <div>
            {askForUsername === true ?
                <div>
                    <h2>Enter into Lobby</h2>
                    <TextField
                        id="outlined-basic"
                        label="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <Button variant="contained" onClick={connect}>Connect</Button>
                </div>
                :
                <div className= {styles.meetVideoContainer}>
                
                {showModal ?<div className={styles.chatRoom}>
                        <h1>Chat</h1>
                        <div className={styles.chattingDisplay}>
                         {messages.map((item, index)=> {
                            return (
                            <div key={index}>
                             <p style={{fontWeight:"bold"}}>{item.sender}</p>
                             <p>{item.data}</p>
                            </div>
                            );
                          })}
                       </div>

                        <div className={styles.chattingArea}>
                            <TextField  
                                value={messageInput} 
                                onChange={(e) => setMessageInput(e.target.value)}
                                id="outlined-basic" 
                                label="Enter your chat" 
                                variant="outlined" 
                            />
                            <Button variant='contained' onClick={sendMessages}>SEND</Button>
                        </div>
                    </div> : <></>}

                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo}style={{color:"white" }}>
                            {(video===true) ? <VideocamIcon></VideocamIcon>: <VideocamOffIcon></VideocamOffIcon>}
                        </IconButton>
                        <IconButton onClick ={handleEndCall}style={{color:"red" }}>
                            <CallEndIcon/>
                        </IconButton>
                        <IconButton onClick={handleAudio}  style={{color:"white" }}>
                            {(audio === true ? <MicIcon/>: <MicOffIcon />)}
                        </IconButton>

                        {screenAvailable === true ?
                        <IconButton onClick={handleScreen} style={{color:"white" }}>
                            {screen === true ? <ScreenShareIcon/> : <StopScreenShareIcon/>}
                        </IconButton> : <></>}

                        <Badge badgeContent={newMessages} max={999} color='secondary'>
                            <IconButton onClick={()=> setModal(!showModal)} style={{color:"white" }}>
                                <ChatIcon></ChatIcon>
                        </IconButton>
                        </Badge>

                    </div>
                    <video className={styles.meetUserVideo}
                        ref={localVideoRef}
                        autoPlay
                        muted
                    >
                    </video>
                    <div className={styles.conferenceView} >
                    {videos.map((video) => (
                        <div className={styles.conferenceView} key={video.socketId}>
                            <video
                                data-socket={video.socketId}
                                ref={ref => {
                                    if (ref && video.stream) {
                                        ref.srcObject = video.stream;
                                    }
                                }}
                                autoPlay
                                playsInline
                            >
                            </video>
                        </div>
                    ))}
                    </div>
                </div>
            }
        </div>
    );
}
