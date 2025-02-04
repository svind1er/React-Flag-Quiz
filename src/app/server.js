const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

// Store connected clients
const clients = new Set();

wss.on("connection", (ws) => {
    console.log("🟢 New WebSocket connection");
    clients.add(ws);

    ws.on("close", () => {
        console.log("🔴 Client disconnected");
        clients.delete(ws);
    });
});

// API endpoint that sends updates to WebSocket clients
app.post("/track-guess", (req, res) => {
    console.log("📩 Guess received:", req.body);

    // Send the data to all connected WebSocket clients
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(req.body));
        }
    });

    res.json({ message: "Guess received and broadcasted!" });
});

// Start the server
server.listen(1337, () => console.log("🚀 Server running on port 1337"));
