const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello, Express!");
  res.send("sadsa");
  console.log("asdasd");
});
// console.log("adsads");

app.post("/api/data", (req, res) => {
  const data = req.body;
  // Process the data...
  res.json({ message: "Data received successfully!" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log("dasnkdnasdjsad");
});
