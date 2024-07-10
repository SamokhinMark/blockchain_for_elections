import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { webSockets } from "@libp2p/websockets";
import { yamux } from "@chainsafe/libp2p-yamux";
import { noise } from "@chainsafe/libp2p-noise";
import { mdns } from "@libp2p/mdns";
import { identify } from "@libp2p/identify";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { logMessage } from "../utils/functions.js";
import { TOPIC } from "../utils/constants.js";
export async function createServerNode() {
    const serverNode = await createLibp2p({
        addresses: {
            listen: [
                '/ip4/0.0.0.0/tcp/0'
            ]
        },
        transports: [
            tcp(),
            webSockets()
        ],
        streamMuxers: [
            yamux()
        ],
        connectionEncryption: [
            noise()
        ],
        connectionManager: {},
        peerDiscovery: [
            mdns({
                interval: 2000
            })
        ],
        services: {
            identify: identify(),
            pubsub: gossipsub()
        }
    });
    const id = serverNode.peerId.toString();
    serverNode.addEventListener('peer:discovery', async (e) => {
        logMessage(id, `peer found: ${e.detail.id.toString()}`);
    });
    serverNode.addEventListener('peer:connect', async (e) => {
        logMessage(id, `connected to: ${e.detail.toString()}`);
    });
    // serverNode.services.pubsub.addEventListener('message', async (message) => {
    //     const messageJSON = JSON.parse(new TextDecoder().decode(message.detail.data));
    //     switch (messageJSON.type) {
    //         case 'last-block':
    //             if (isLastBlockReceived) {
    //                 return;
    //             }
    //             const lastBlockHash = messageJSON.data.block.currBlockHash;
    //             const allPeersInPubSub = serverNode.services.pubsub.getSubscribers(TOPIC);
    //             const rng = new SeedRandom(lastBlockHash);
    //             function chooseRandomNode(nodes) {
    //                 const randomIndex = Math.floor(rng.random() * nodes.length);
    //                 return nodes[randomIndex];
    //             }
    //             const selectedNode = chooseRandomNode(allPeersInPubSub);
    //
    //             const messageSelectedGenerator = JSON.stringify({
    //                 type: 'generator',
    //                 data: selectedNode
    //             })
    //             const messageSelectedGeneratorEncode: Uint8Array = new TextEncoder().encode(messageSelectedGenerator);
    //             await serverNode.services.pubsub.publish(TOPIC, messageSelectedGeneratorEncode);
    //             isLastBlockReceived = true;
    //             break;
    //     }
    // })
    setInterval(async () => {
        const message = {
            type: "start-election",
            data: {
                pingNode: id
            }
        };
        const messageUint8Array = new TextEncoder().encode(JSON.stringify(message));
        await serverNode.services.pubsub.publish(TOPIC, messageUint8Array);
    }, 5 * 1000);
    logMessage(id, `node instance has started`);
    serverNode.services.pubsub.subscribe(TOPIC);
    logMessage(id, `node is subscribed to ${serverNode.services.pubsub.getTopics()}`);
    return serverNode;
}
createServerNode().catch(e => console.log(e));
