const express = require("express");
const cors = require("cors");

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  console.log(req);
  res.send("Hello, Express!");
  console.log("asdasd");
});

app.post("/", (req, res) => {
  console.log(req.body);
  res.status(200).json({ message: "Data received successfully!" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
