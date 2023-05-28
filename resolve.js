import {} from "dotenv/config";
import axios from "axios";

let config = {
  method: "get",
  maxBodyLength: Infinity,
  url: "https://api.everyname.xyz/forward?domain=fabriguespe.cb.id",
  headers: {
    Accept: "application/json",
    "api-key": process.env.EVERYNAME_KEY,
  },
};
console.log(process.env.EVERYNAME_KEY);
axios
  .request(config)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error);
  });
