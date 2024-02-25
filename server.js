const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);


var node_mailer = require("nodemailer");

const transporter = node_mailer.createTransport({
    port: 587, 
    host: "smtp.gmail.com", 
    auth: {
        user: "ajaysathishpreetha2.0@gmail.com", 
        pass: "ksthysbtsgjxpxdv"
    },
    secure : true
})

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

app.post("/send-mail", (req, res) => {
    const recipient = req.body.to
    const url = req.body.url
    const mail_data = {
        from : "ajaysathishpreetha2.0@gmail.com", 
        to : recipient,
        subject : 'Mail Invitation',
        html: `<p>Hey there,</p><p>Come and join me for a video chat here - ${url}</p>`
    }

    transporter.sendMail(mail_data, (error , info) => {
        
        if(error) {
            return console.log(error);
        }
        
        res.status(200).send({ message: "Invitation sent!", message_id: info.messageId });
    })
})

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("user-connected", userId);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(process.env.PORT || 3030);