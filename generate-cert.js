import selfsigned from "selfsigned";
import fs from "fs";

const attrs = [{ name: "commonName", value: "localhost" }];
const pems = selfsigned.generate(attrs, { days: 365 });

fs.writeFileSync("server.cert", pems.cert);
fs.writeFileSync("server.key", pems.private);

console.log("Self-signed certificates generated successfully.");
