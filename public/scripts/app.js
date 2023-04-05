const web3 = new Web3(window.ethereum);

function init() {
    return {
        account: null,
        balance: 0,
        playerScore: 0,
        computerScore: 0,
        choice: null,
        contract: null,
        stake: 100000,
        resultMessage: 'Start the game.',
        resultClass: 'bg-white text-gray-700',
        lock: false,
        minStake: 100000,
        async init() {
            this.initAccount();
            this.initContract();
            this.setUpEventListeners();
        },
        async changeNetwork() {
            const sepoliaChainId = 11155111;
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: web3.utils.toHex(sepoliaChainId) }]
            });
        },
        async connect() {
            if(window.ethereum) {
                await ethereum.enable();
                this.initAccount();
                this.changeNetwork();
            }
        },
        initAccount() {
            web3.eth.getAccounts((error,accounts) => {
                this.account = accounts[0];
                this.updateBalance();
                this.changeNetwork();
            });
        },
        initContract() {
            this.contract = new web3.eth.Contract([
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "result",
                            "type": "uint256"
                        }
                    ],
                    "name": "FinishedEvent",
                    "type": "event"
                },
                {
                    "inputs": [],
                    "name": "MIN_BET",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "deposit",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "playerChoice",
                            "type": "uint256"
                        }
                    ],
                    "name": "play",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "payable",
                    "type": "function"
                }
            ], "0x1ae87e36c33901B19a91e3a47dc25440B94378e2");
        },
        setUpEventListeners() {
            var self = this;

            this.contract.events.FinishedEvent(() => {})
            .on("data", function(event) {
                if(parseInt(event.returnValues.result) === 0) {
                    self.playerScore++;
                    self.resultMessage = "You won!";
                    self.resultClass = "bg-green-600 text-white";
                } else if(parseInt(event.returnValues.result) === 1) {
                    self.computerScore++;
                    self.resultMessage = "You lost!";
                    self.resultClass = "bg-red-600 text-white";
                } else if(parseInt(event.returnValues.result) === 2) {
                    self.resultMessage = "It's a draw!";
                    self.resultClass = "bg-gray-600 text-white";
                }
                self.updateBalance();
                self.lock = false;
            });
        },
        updateBalance() {
            web3.eth.getBalance(this.account).then((value) => {
                this.balance = web3.utils.fromWei(value.toString(), 'gwei');
                this.balance = Math.round(this.balance);
            });
        },
        play(choice) {
            this.lock = true;
            const receipt = this.contract.methods.play(choice)
                .send({from: this.account, value: web3.utils.toWei(this.stake.toString(), 'gwei')})
                .catch((error) => {
                    this.lock = false;
                });
        },
    };
}
