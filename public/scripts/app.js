const web3 = new Web3(window.ethereum);

// const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
// account = accounts[0];


function init() {
    return {
        account: null,
        balance: 0,
        playerScore: 0,
        computerScore: 0,
        choice: null,
        contract: null,
        stake: 0,
        resultMessage: 'Start the game.',
        resultClass: 'bg-white text-gray-700',
        async init() {
            this.initAccount();            
            var self = this;

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
            ], "0x70a5520B02F8ca9eB4de3F54e190d0EA3963843D");

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
                });
        },
        async connect() {
            if(window.ethereum) {
                await ethereum.enable();
                this.initAccount();
            }
        },
        initAccount() {
            web3.eth.getAccounts((error,accounts) => {
                this.account = accounts[0];
                this.updateBalance();                
            });
        },
        updateBalance() {
            web3.eth.getBalance(this.account).then((value) => {
                this.balance = web3.utils.fromWei(value.toString(), 'gwei');
                this.balance = Math.round(this.balance);
            });
        },
        play(choice) {
            console.log(web3.utils.toWei(this.stake.toString(), 'gwei'));
            const receipt = this.contract.methods.play(choice)
                .send({from: this.account, value: web3.utils.toWei(this.stake.toString(), 'gwei')});
        }
    };
}
