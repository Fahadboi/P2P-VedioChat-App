import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "./Providers/SocketProvider";
import ReactPlayer from "react-player";
import peer from "./services/peer";

export default function Room() {
  const { roomId } = useParams();
  const socket = useSocket();
  const [remoteUser, setRemoteUser] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);




  const handleUserJoined = useCallback(({ email, roomId }) => {
    setRemoteUser({ email, roomId });
  }, []);



  const handleIncomingCall = useCallback( async ({socketId, from, offer}) => {
    setRemoteUser({email:from});
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const answer = await peer.getAnswer(offer);
    socket.emit("call-accepted", {to: from, answer});
  }, [socket]);


  const sendStreams = useCallback( () => {
    for(const track of myStream.getTracks()){
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleAcceptCall = useCallback(async({socketId, from, answer}) => {
    await peer.setLocalDescription(answer);
    console.log("call accepted.")
    sendStreams();
  }, [sendStreams]);

  const handleNegotiationNeeded = useCallback( async() => {
    const offer = await peer.getOffer();
    socket.emit("negotiation-needed", {to: remoteUser.email, offer});
  }, [remoteUser, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegotiationNeeded);

    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
    }
  }, [handleNegotiationNeeded]);



  const handleNegotiationIncoming = useCallback(async ({from, offer}) => {
    const answer = await peer.getAnswer(offer);
    socket.emit("negotiation-done", {to: from, answer});
  }, [socket]);


  const handleNegotiationFinal = useCallback(async({answer}) => {
    await peer.setLocalDescription(answer);
    

  }, []);





  useEffect(() => {
    peer.peer.addEventListener('track', async (ev) => {
      const remoteUserStream = ev.streams;
      setRemoteStream(remoteUserStream[0]);
    } )
  }, []);


  useEffect(() => {
    socket.on("user-joined", handleUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleAcceptCall);
    socket.on("negotiation-needed", handleNegotiationIncoming);
    socket.on("negotiation-final", handleNegotiationFinal);


    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleAcceptCall);
      socket.off("negotiation-needed", handleNegotiationIncoming);
      socket.off("negotiation-final", handleNegotiationFinal);



    };
  }, [socket, handleUserJoined, handleIncomingCall, handleAcceptCall, handleNegotiationIncoming, handleNegotiationFinal]);





  const handleRequestCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("call-user", {to: remoteUser, offer});
    setMyStream(stream);
  }, [remoteUser, socket]);



  return (
    <div style={{ margin: "30px" }}>
      <h1>Room: {roomId}</h1>
      <div
        style={{
          marginTop: "15px",
          padding: "15px",
          backgroundColor: "lightblue",
          width: "25%",
          borderRadius: "10px",
        }}
      >
        <h4 style={{ marginBottom: "15px" }}>Connected Users</h4>
        <div style={{ display: "flex", alignItems: "center" }}>
          {remoteUser ? (
            <p>{remoteUser?.email} Connected</p>
          ) : (
            <p>No user connected</p>
          )}
          {remoteUser && !remoteStream && (
            <button
              style={{
                paddingLeft: "10px",
                paddingRight: "10px",
                width: "60px",
                cursor: "pointer",
              }}
              onClick={handleRequestCall}
            >
              Call
            </button>
          )}
          {myStream &&
            <button
              style={{
                paddingLeft: "10px",
                paddingRight: "10px",
                width: "60px",
                cursor: "pointer",
              }}
              onClick={sendStreams}
            >
              Send Streams
            </button>
          }
        </div>
      </div>
      <div style={{ marginTop: "20px", backgroundColor:"lightgreen", borderRadius:"20px", width:"70%"}}>
        {<div style={{padding:"20px"}}>
          <h3 style={{marginBottom:"10px"}}>My Vedio</h3>
          <ReactPlayer height={200} width={300} url={myStream} playing muted />
        </div>}
        {remoteStream && <div style={{padding:"20px"}}>
          <h3 style={{marginBottom:"10px"}}>Remote Vedio</h3>
          <ReactPlayer height={200} width={300} url={remoteStream} playing muted />
        </div>
        }
      </div>
    </div>
  );
}
