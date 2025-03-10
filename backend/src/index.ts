import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./lib/db.js";
import dotenv from "dotenv";
import cors from "cors";
import messageRoutes from "./routes/messageRoutes.js";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map<string, WebSocket>();

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

interface ClientMessage {
  sender: string;
  recipientId: string;
  content?: string;
  image?: string;
  timestamp?: string;
  type?: string;
  messageId?: string;
}

wss.on("connection", (ws: WebSocket) => {
  console.log("New client connected");

  ws.on("message", (message: string) => {
    try {
      const parsedMessage: ClientMessage = JSON.parse(message);

      if (parsedMessage.type === "connect" && parsedMessage.sender) {
        clients.set(parsedMessage.sender, ws);
        console.log(`User ${parsedMessage.sender} connected`);
        return;
      }

      const { sender, recipientId, content, image, timestamp, type , messageId } = parsedMessage;
      const recipientWs = clients.get(recipientId);

      if (type === "typing") {
        if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
          recipientWs.send(JSON.stringify({ sender, type: "typing" }));
        }
        return;
      }

      if (type === "read" && messageId) {
        if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
          recipientWs.send(JSON.stringify({ type: "read", messageId }));
        }
        return;
      }

      if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
        recipientWs.send(JSON.stringify({ sender, content, image, timestamp }));
      }

      const senderWs = clients.get(sender);
      if (senderWs && senderWs.readyState === WebSocket.OPEN) {
        senderWs.send(JSON.stringify({ sender, content, image, timestamp }));
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    for (const [userId, clientWs] of clients) {
      if (clientWs === ws) {
        clients.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("App is listening on port", PORT);
  connectDB();
});

export { wss, clients };