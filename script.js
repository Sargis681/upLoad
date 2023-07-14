const express = require("express");
const cors = require("cors");

const app = express();
const port = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  console.log(req);
  res.send("Hello, Express!");
  console.log("asdasd");
});
// console.log("adsads");

app.post("/", (req, res) => {
  console.log(req.body);
  // Process the data...
  res.status(200).json({ message: "Data received successfully!" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
