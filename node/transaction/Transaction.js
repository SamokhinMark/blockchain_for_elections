import CryptoJS from "crypto-js";
export class Transaction {
    txhash;
    timestamp;
    sender;
    receiver;
    constructor(timestamp, sender, receiver) {
        this.timestamp = timestamp;
        this.sender = sender;
        this.receiver = receiver;
        this.txhash = this.calculateTxHash();
    }
    calculateTxHash() {
        const data = JSON.stringify(this.timestamp) +
            JSON.stringify(this.sender) +
            JSON.stringify(this.receiver);
        return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
    }
}
