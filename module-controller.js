import redis from "redis";
import "dotenv/config";
import nusmods from "./module-model.js";
import mongoose from "mongoose";

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

let mongoDB = process.env.MONGO_DB_URI;

mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Successfully connected to MongoDB"));

export async function fetchModules(ay) {
  const result = await nusmods.findOne({ ay: ay });
  return result.modules;
}

export async function getModules(req, res) {
  const { ay } = req.params;

  if (!ay) {
    return res.status(400).json({ message: `Academic year is required.` });
  }

  try {
    let modules;
    let isCached = false;

    const cacheResults = await redisClient.get(ay);
    if (cacheResults) {
      isCached = true;
      modules = JSON.parse(cacheResults);
    } else {
      modules = await fetchModules(ay);
      if (modules.length === 0) {
        throw "API returned an empty array";
      }
      await redisClient.set(ay, JSON.stringify(modules));
    }

    res.send({
      fromCache: isCached,
      data: modules,
    });
  } catch (err) {
    console.log("err: " + err);
    return res.status(500).json({ message: err });
  }
}
