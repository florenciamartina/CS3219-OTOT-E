import axios from "axios";
import redis from "redis";
import "dotenv/config";

let redisClient;
(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

export async function fetchModules(ay) {
  const AZURE_URL = process.env.AZURE_URL;
  const modules = await axios.get(`${AZURE_URL}&ay=${ay}`);
  return modules.data;
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
