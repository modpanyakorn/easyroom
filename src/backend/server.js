require("dotenv").config();
const listEndpoints = require("express-list-endpoints");
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    // origin: ["http://localhost:5501", "http://localhost:3000"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5501", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      // maxAge: 3600000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// โฟลเดอร์เก็บรูป
const uploadDir = path.join(__dirname, "./storage/equipment_img");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// ให้ Express ให้บริการไฟล์รูปแบบ Static
app.use("/storage/equipment_img", express.static(uploadDir));

// Routes
app.use("/auth", require("./core/auth/auth.routes"));
app.use("/booker", require("./modules/booker/booker.routes"));
app.use("/admin", require("./modules/admin/admin.routes"));

// list endpoints
console.log("📚 API Endpoints:");
console.table(listEndpoints(app));

// Socket.IO events
io.on("connection", (socket) => {
  console.log("📡 Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// Start server
const HOST = process.env.API_HOST || "localhost";
const PORT = process.env.API_PORT || 3000;
server.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}`);
});
