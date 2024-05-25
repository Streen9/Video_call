import { useState, useRef } from 'react';
import { Peer } from 'peerjs';
import './VideoCall.css';

const VideoCall = () => {
    const [, setPeer] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [peerList, setPeerList] = useState([]);
    const [userName, setUserName] = useState('');
    const [receiverName, setReceiverName] = useState('');
    const [initialized, setInitialized] = useState(false);
    const peerRef = useRef(null);

    const handleInit = () => {
        const newPeer = new Peer(userName);
        peerRef.current = newPeer;

        newPeer.on('open', (id) => {
            console.log(`${id} connected`);
            setInitialized(true);
        });

        newPeer.on('call', (call) => {
            navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            }).then((stream) => {
                setMyStream(stream);
                addLocalVideo(stream);
                call.answer(stream);
                call.on('stream', (remoteStream) => {
                    if (!peerList.includes(call.peer)) {
                        addRemoteVideo(remoteStream);
                        setPeerList((prevPeerList) => [...prevPeerList, call.peer]);
                    }
                });
            }).catch((err) => {
                console.log(`Unable to connect because ${err}`);
            });
        });

        setPeer(newPeer);
    };

    const makeCall = () => {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        }).then((stream) => {
            setMyStream(stream);
            addLocalVideo(stream);
            const call = peerRef.current.call(receiverName, stream);
            call.on('stream', (remoteStream) => {
                if (!peerList.includes(call.peer)) {
                    addRemoteVideo(remoteStream);
                    setPeerList((prevPeerList) => [...prevPeerList, call.peer]);
                }
            });
        }).catch((err) => {
            console.log(`Unable to connect because ${err}`);
        });
    };

    const addLocalVideo = (stream) => {
        const video = document.createElement("video");
        video.srcObject = stream;
        video.classList.add("video");
        video.muted = true;
        video.play();
        document.getElementById("localVideo").append(video);
    };

    const addRemoteVideo = (stream) => {
        const video = document.createElement("video");
        video.srcObject = stream;
        video.classList.add("video");
        video.play();
        document.getElementById("remoteVideo").append(video);
    };

    const toggleVideo = (b) => {
        if (myStream) {
            myStream.getVideoTracks()[0].enabled = b === "true";
        }
    };

    const toggleAudio = (b) => {
        if (myStream) {
            myStream.getAudioTracks()[0].enabled = b === "true";
        }
    };

    return (
        <>
            {!initialized ? (
                <div>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                    />
                    <button onClick={handleInit}>Initialize</button>
                </div>
            ) : (
                <>
                    <div>
                        <input
                            type="text"
                            value={receiverName}
                            onChange={(e) => setReceiverName(e.target.value)}
                            placeholder="Enter receiver's name"
                        />
                        <button onClick={makeCall}>Start Call</button>
                    </div>
                    <div style={{ display: 'block', justifyContent: 'space-around', margin: '0px' }}>
                        <div className="primary-video" id="remoteVideo"></div>
                        <div className="secondary-video" id="localVideo"></div>
                    </div>
                    <button onClick={() => toggleVideo("true")}>Turn Video On</button>
                    <button onClick={() => toggleVideo("false")}>Turn Video Off</button>
                    <button onClick={() => toggleAudio("true")}>Turn Audio On</button>
                    <button onClick={() => toggleAudio("false")}>Turn Audio Off</button>
                </>
            )}
        </>
    );
};

export default VideoCall;
