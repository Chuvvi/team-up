import express from "express";
import "dotenv/config";
import ApiRoutes from "./routes";
import cors from "cors";
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.response.success = function (data) {
  this.status(200).send(data);
};

app.response.error = function (code, message) {
  message = typeof message != "string" ? "Something went wrong" : message;
  this.status(code).send({ code, error: message });
};

app.response.unauthorizedUser = function () {
  console.log("Unauthorized User");
  this.status(404).send("Unauthorized User");
};

app.response.accessDenied = function () {
  console.log("Access Denied.");
  this.status(403).send("Access Denied");
};

app.use("/", ApiRoutes);

app.listen(process.env.PORT, () => {
  console.log("Yep this is working 🍺");
  console.log("We've now got a server 🦄");
  console.log(`App listen on port: ${process.env.PORT} 🍕`);
  console.log(`Server Url:  http://localhost:${process.env.PORT}`);
});
