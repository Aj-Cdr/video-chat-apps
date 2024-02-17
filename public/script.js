const socket = io("/");

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443",
});

const user = prompt("Enter your name");

const my_video = document.createElement("video")
my_video.muted = true

// let my_stream

navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
})
.then((stream)=>{
    // my_stream = stream
    display_my_video_stream(my_video , stream)

    socket.on("userconnected", (userid) => {
        connectToNewUser(userid, stream);
    })
})

function connectToNewUser(userid, stream){
    const call = peer.call(userid, stream)
    const video = document.createElement("video")
    call.on("stream", (userVideoStream) => {
        display_my_video_stream(video, userVideoStream)
    })
}

function display_my_video_stream(myVideo, stream){ 
    myVideo.srcObject = stream
    myVideo.addEventListener("loadedmetadata", () => {
        myVideo.play()
        $("#video_grid").append(myVideo)
    })
}

$(function () {
    $("#show_chat").click(function () {
        $(".left-window").css("display", "none")
        $(".right-window").css("display", "block")
        $(".header_back").css("display", "block")
    })
    $(".header_back").click(function () {
        $(".left-window").css("display", "block")
        $(".right-window").css("display", "none")
        $(".header_back").css("display", "none")
    })

    $("#send").click(function () {
        if ($("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })

    $("#mute").click(function () {
        const enabled = myStream.getAudioTracks()[0].enabled;
        if (enabled) {
            myStream.getAudioTracks()[0].enabled = false;
            html = `<i class="fas fa-microphone-slash"></i>`;
            $("#mute_button").toggleClass("background_red");
            $("#mute_button").html(html)
        } else {
            myStream.getAudioTracks()[0].enabled = true;
            html = `<i class="fas fa-microphone"></i>`;
            $("#mute_button").toggleClass("background_red");
            $("#mute_button").html(html)
        }
    })

    
    $("#stop_video").click(function () {
        const enabled = myStream.getVideoTracks()[0].enabled;
        if (enabled) {
            myStream.getVideoTracks()[0].enabled = false;
            html = `<i class="fas fa-video-slash"></i>`;
            $("#stop_video").toggleClass("background_red");
            $("#stop_video").html(html)
        } else {
            myStream.getVideoTracks()[0].enabled = true;
            html = `<i class="fas fa-video"></i>`;
            $("#stop_video").toggleClass("background_red");
            $("#stop_video").html(html)
        }
    })

    $("#chat_message").keydown(function (e) {
        if (e.key == "Enter" && $("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })

})

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
});

socket.on("createMessage", (message, userName) => {
    $(".messages").append(`
        <div class="message">
            <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
        }</span> </b>
            <span>${message}</span>
        </div>
    `)
});