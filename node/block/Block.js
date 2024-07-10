import CryptoJS from "crypto-js";
export class Block {
    index;
    timestamp;
    prevBlockHash;
    merkleRoot;
    currBlockHash;
    generator;
    txCount;
    txs;
    constructor(index, timestamp, prevBlockHash, generator, txs) {
        this.index = index;
        this.timestamp = timestamp;
        this.prevBlockHash = prevBlockHash;
        this.generator = generator;
        this.txs = txs;
        this.txCount = txs.length;
        this.merkleRoot = this.calculateMerkleRoot();
        this.currBlockHash = this.calculateCurrBlockHash();
    }
    static createGenesis(txs) {
        const generator = "0000000000000000000000000000000000000000";
        const prevBlockHash = "0000000000000000000000000000000000000000";
        return new Block(0, Date.now(), prevBlockHash, generator, txs);
    }
    calculateCurrBlockHash() {
        const currBlockString = this.prevBlockHash.toString()
            + this.timestamp.toString()
            + JSON.stringify(this.txs)
            + this.merkleRoot.toString();
        return CryptoJS.SHA256(currBlockString).toString(CryptoJS.enc.Hex);
    }
    static fromData(index, timestamp, prevBlockHash, generator, txs) {
        return new Block(index, timestamp, prevBlockHash, generator, txs);
    }
    calculateMerkleRoot() {
        if (this.txs.length <= 0) {
            return '';
        }
        const leafHashes = this.txs.map(transaction => CryptoJS.SHA256(JSON.stringify(transaction)).toString(CryptoJS.enc.Hex));
        return this.buildMerkleTree(leafHashes)[0];
    }
    buildMerkleTree(hashes) {
        if (hashes.length === 1) {
            return hashes;
        }
        const nextLevel = [];
        for (let i = 0; i < hashes.length; i += 2) {
            const left = hashes[i];
            const right = (i + 1 < hashes.length) ? hashes[i + 1] : left;
            const concatenatedHash = left + right;
            const parentHash = CryptoJS.SHA256(concatenatedHash).toString(CryptoJS.enc.Hex);
            nextLevel.push(parentHash);
        }
        return this.buildMerkleTree(nextLevel);
    }
    getMerkleProof() {
        const proof = [];
        const leafHashes = this.txs.map(transaction => CryptoJS.SHA256(JSON.stringify(transaction)).toString(CryptoJS.enc.Hex));
        const rootHash = this.merkleRoot;
        let currentHashes = leafHashes;
        while (currentHashes.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentHashes.length; i += 2) {
                const left = currentHashes[i];
                const right = (i + 1 < currentHashes.length) ? currentHashes[i + 1] : left;
                const concatenatedHash = left + right;
                const parentHash = CryptoJS.SHA256(concatenatedHash).toString(CryptoJS.enc.Hex);
                nextLevel.push(parentHash);
            }
            proof.push(...currentHashes.filter(hash => !nextLevel.includes(hash)));
            currentHashes = nextLevel;
        }
        proof.push(rootHash);
        return proof;
    }
}
