import express from "express";
import { getModules } from "./module-controller.js";

const app = express();
const port = process.env.PORT || 3000;

app.get("/modules/:ay", getModules);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
