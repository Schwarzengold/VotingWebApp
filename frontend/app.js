const contractAddress = "0x9FEfC90d90beda484aED3CB27a872Be047535b2f"; 
const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [{ "internalType": "string", "name": "_name", "type": "string" }],
        "name": "addCandidate",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function",
        "payable": true
    },
    {
        "inputs": [{ "internalType": "string", "name": "_name", "type": "string" }],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getWinner",
        "outputs": [{ "internalType": "string", "name": "winnerName", "type": "string" }],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [],
        "name": "getCandidateList",
        "outputs": [{ "internalType": "string[]", "name": "", "type": "string[]" }],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    }
];

let web3;
let contract;
let accounts;

async function connectWeb3() {
    if (window.ethereum) {
        try {
            web3 = new Web3(window.ethereum);
            accounts = await ethereum.request({ method: "eth_requestAccounts" });

            console.log("✅ MetaMask connected:", accounts[0]);

            contract = new web3.eth.Contract(contractABI, contractAddress);
            console.log("✅ Contract loaded:", contract);

            loadCandidates();
        } catch (error) {
            console.error("❌ Web3 connection error:", error);
            showToast("Failed to connect to MetaMask!", "danger");
        }
    } else {
        alert("Please install MetaMask!");
    }
}

async function addCandidate() {
    const name = document.getElementById("candidateName").value.trim();
    if (!name) return showToast("Please enter a candidate name!", "warning");

    try {
        await contract.methods.addCandidate(name).send({
            from: accounts[0],
            value: web3.utils.toWei("0.01", "ether")
        });

        showToast(`Candidate ${name} has been added!`, "success");
        loadCandidates();
    } catch (error) {
        console.error("❌ Error adding candidate:", error);
        showToast("Failed to add candidate!", "danger");
    }
}

async function loadCandidates() {
    try {
        const candidates = await contract.methods.getCandidateList().call();
        const list = document.getElementById("candidatesList");
        list.innerHTML = "";

        if (candidates.length === 0) {
            console.warn("⚠️ No candidates available!");
            return;
        }

        candidates.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            list.appendChild(option);
        });

        console.log("✅ Loaded candidates:", candidates);
    } catch (error) {
        console.error("❌ Error loading candidates:", error);
    }
}

async function vote() {
    const candidate = document.getElementById("candidatesList").value;
    if (!candidate) return showToast("Please select a candidate!", "warning");

    try {
        await contract.methods.vote(candidate).send({ from: accounts[0] });
        showToast(`You voted for ${candidate}!`, "success");
    } catch (error) {
        console.error("❌ Error voting:", error);
        showToast("Voting failed!", "danger");
    }
}

async function getWinner() {
    try {
        const winner = await contract.methods.getWinner().call({ from: accounts[0] });
        showToast(`Winner: ${winner}`, "info");
    } catch (error) {
        console.error("❌ Error getting winner:", error);
        showToast("Failed to get the winner!", "danger");
    }
}

function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");

    toast.className = `toast align-items-center text-white bg-${type} border-0 show`;
    toast.role = "alert";
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

window.addEventListener("load", connectWeb3);
