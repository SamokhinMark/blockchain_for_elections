import {TOPIC} from "../../utils/constants.js";
import * as secp from '@noble/secp256k1';
import bs58 from "bs58";

export function setupRoutes(app, node, db) {
    app.get('/counts', async (req, res) => {
        const chain = await db.getAllFrom('chain');
        const txs = await db.getAllFrom('transactions');
        const state = await db.getAllFrom('state');
        const votedAddrs = await db.getAllFrom('votedAddresses')

        const responseJSON = {
            countBlocks: chain.length,
            countTxs: txs.length,
            countState: state.length,
            countVotedAddrs: votedAddrs.length
        }
        if (!responseJSON) {
            return res.status(400).json({message: "Something went wrong."});
        } else {
            return res.status(200).json(responseJSON);
        }
    })

    app.get('/chain', async (req, res) => {
        const chain = await db.getAllFrom('chain');
        if (!chain) {
            return res.status(400).json({message: "Something went wrong."});
        } else {
            chain.sort((a, b) => {return b.block_index - a.block_index})
            return res.status(200).json(chain);
        }
    })

    app.get('/chain/:id', async (req, res) => {
        const block = await db.getBlockById(+req.params.id);
        if (!block) {
            return res.status(400).json({message: "Something went wrong"});
        } else {
            return res.status(200).json(block)
        }
    })

    app.get('/txs', async (req, res) => {
        const txs = await db.getAllFrom('transactions');
        if (!txs) {
            return res.status(400).json({message: "Something went wrong."});
        } else {
            return res.status(200).json(txs);
        }
    })

    app.get('/state', async (req, res) => {
        const state = await db.getAllFrom('state');
        if (!state) {
            return res.status(400).json({message: "Something went wrong."});
        } else {
            return res.status(200).json(state);
        }
    })

    app.get('/voted-addrs', async (req, res) => {
        const votedAddrs = await db.getAllFrom('votedAddresses');
        if (!votedAddrs) {
            return res.status(400).json({message: "Something went wrong."});
        } else {
            return res.status(200).json(votedAddrs);
        }
    })

    app.get('/create-wallet', async (req, res) => {
        const privateKeyBytes: Uint8Array = secp.utils.randomPrivateKey();
        const publicKeyBytes: Uint8Array = secp.getPublicKey(privateKeyBytes);

        const privateKey: string =  Buffer.from(privateKeyBytes).toString('hex');
        const publicKey: string = Buffer.from(publicKeyBytes).toString('hex');
        const address: string = bs58.encode(publicKeyBytes);

        const message = {
            privateKey: privateKey,
            publicKey: publicKey,
            address: address
        }
        return res.status(201).json(message);
    })

    app.post('/add-candidate', async (req, res) => {
        const { data } = req.body;
        if (!data) {
            return res.status(400).json({ error: 'Value data is required' });
        }
        const message = JSON.stringify({type: 'new-local-candidate', data});
        node.services.pubsub.dispatchEvent(new CustomEvent('message', { detail: { data: Buffer.from(message), from: node.peerId }}));
        res.json({status: 'Candidate sent'});
    })

    app.post('/add-transaction', async (req, res) => {
        const data = req.body;
        if (!data) {
            return res.status(400).json({ error: 'Value data is required' });
        } else if (!data.sender && !data.receiver && !data.timestamp) {
            return res.status(400).json({ error: 'Values sender, receiver and timestamp are required' });
        }
        const message = JSON.stringify({type: 'new-local-tx', data});
        node.services.pubsub.dispatchEvent(new CustomEvent('message', { detail: { data: Buffer.from(message), from: node.peerId }}));
        res.status(201).json({data: 'Tx sent'});
    })
    // app.post('/send-transaction', async (req, res) => {
    //     const data  = req.body;
    //     if (!data) {
    //         return res.status(400).json({ error: 'Transaction data is required' });
    //     }
    //
    //     const message = JSON.stringify({ type: 'transaction', data });
    //     await serverNode.services.pubsub.publish(TOPIC, Buffer.from(message));
    //     res.json({ status: 'Transaction sent' });
    // });
    //
    // app.post('/add-block', async (req, res) => {
    //     const { data } = req.body;
    //     if (!data) {
    //         return res.status(400).json({ error: 'Block data is required' });
    //     }
    //
    //     const message = JSON.stringify({type: 'block', data});
    //     await serverNode.services.pubsub.publish(TOPIC, Buffer.from(message))
    //     res.json({status: 'Block sent'});
    // })
    //
    // app.post('/add-wallet', async (req, res) => {
    //     const { data } = req.body;
    //     if (!data) {
    //         return res.status(400).json({ error: 'Wallet data is required' });
    //     }
    //
    //     const message = JSON.stringify({type: 'new-wallet', data});
    //     await serverNode.services.pubsub.publish(TOPIC, Buffer.from(message))
    //     res.json({status: 'Wallet sent'});
    // })
    //

    //
    //     return res.status(200).json(response);
    // })
    //
    //
    // app.get('/txs', async (req, res) => {
    //     const db = await openDb();
    //     const txs = await getAllFrom(db, 'transactions');
    //     if (!txs) {
    //         return res.status(400).json({message: "Something went wrong."});
    //     } else {
    //         txs.sort((a, b) => {return b.fees - a.fees})
    //         return res.status(200).json(txs);
    //     }
    // })
    //

    //
    // app.get('/counts', async (req, res) => {
    //     const db = await openDb();
    //     const chain = await getAllFrom(db, 'chain');
    //     const txs = await getAllFrom(db, 'transactions');
    //     const state = await getAllFrom(db, 'state');
    //
    //     const responseJSON = {
    //         countBlocks: chain.length,
    //         countTxs: txs.length,
    //         countState: state.length
    //     }
    //     if (!responseJSON) {
    //         return res.status(400).json({message: "Something went wrong."});
    //     } else {
    //         return res.status(200).json(responseJSON);
    //     }
    // })
    //

    //
    // app.get('/create', async (req, res) => {
    //
    //     const response = {
    //         privateKey: Buffer.from(privateKey).toString('hex')
    //     }
    //     if (!privateKey) {
    //         return res.status(400).json({message: "Something went wrong"});
    //     } else {
    //         return res.status(200).json(response);
    //     }
    // })
    //
    // app.get('/balance/:address', async (req, res) => {
    //     const {address} = req.params;
    //     const db = await openDb();
    //     const balance = await getBalance(db, address);
    //     if (!balance) {
    //         return res.status(400).json({message: "Something went wrong"});
    //     } else {
    //         return res.status(200).json(balance);
    //     }
    // })
}
