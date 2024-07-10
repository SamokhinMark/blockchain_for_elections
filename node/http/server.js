import express from "express";
import cors from "cors";
import net from 'net';
import { setupRoutes } from "./routes.js";
import { startNode } from "../peerSetup/node.js";
const app = express();
app.use(cors());
app.use(express.json());
function getRandomPort(min = 1024, max = 65535) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function isPortAvailable(port) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
                resolve(false);
            }
            else {
                reject(err);
            }
        });
        server.once('listening', () => {
            server.close();
            resolve(true);
        });
        server.listen(port);
    });
}
async function findAvailablePort(defaultPort, min = 1024, max = 65535) {
    if (await isPortAvailable(defaultPort)) {
        return defaultPort;
    }
    return await getAvailablePort(min, max);
}
async function getAvailablePort(min = 1024, max = 65535) {
    let port;
    let available = false;
    while (!available) {
        port = getRandomPort(min, max);
        available = await isPortAvailable(port);
    }
    return port;
}
async function startServer() {
    const { node, db } = await startNode();
    setupRoutes(app, node, db);
    const port = await findAvailablePort(8000);
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}
startServer();
