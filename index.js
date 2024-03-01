const express = require('express');
const {Web3} = require('web3');

const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const web3 = new Web3('https://sepolia.infura.io/v3/8fe885b2b1634e9d9bbd0b87a13fc684');

const contractAddress = '0x2AC106F2F2A4Ac192b670FC1A6B93AD748d64E4e';

const fromAddress = '0x6A210703c1ceA5b38Ef12A47209ed455A1C59a56';

const privateKey = '6ec88c3811a477abf3cbd4ac4fde4e5cc68b6f11770a2bf291d6a3fc17c70f23';

const nftContractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "ERC721IncorrectOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "operator",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "ERC721InsufficientApproval",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "approver",
                "type": "address"
            }
        ],
        "name": "ERC721InvalidApprover",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "operator",
                "type": "address"
            }
        ],
        "name": "ERC721InvalidOperator",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "ERC721InvalidOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            }
        ],
        "name": "ERC721InvalidReceiver",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "ERC721InvalidSender",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "ERC721NonexistentToken",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "approved",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "operator",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "approved",
                "type": "bool"
            }
        ],
        "name": "ApprovalForAll",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
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
        "name": "baseTokenURI",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "currentTokenId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "getApproved",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "operator",
                "type": "address"
            }
        ],
        "name": "isApprovedForAll",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            }
        ],
        "name": "mintNFT",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "ownerOf",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "operator",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "approved",
                "type": "bool"
            }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_baseTokenURI",
                "type": "string"
            }
        ],
        "name": "setBaseTokenURI",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "interfaceId",
                "type": "bytes4"
            }
        ],
        "name": "supportsInterface",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "tokenURI",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }];

// Создаем экземпляр контракта NFT
const nftContract = new web3.eth.Contract(nftContractABI, contractAddress);
const contractAddressERC20 = '0xc3611385B62CA881B0f853661E9008d29aaF65D5';

const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "allowance",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "needed",
                "type": "uint256"
            }
        ],
        "name": "ERC20InsufficientAllowance",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "balance",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "needed",
                "type": "uint256"
            }
        ],
        "name": "ERC20InsufficientBalance",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "approver",
                "type": "address"
            }
        ],
        "name": "ERC20InvalidApprover",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            }
        ],
        "name": "ERC20InvalidReceiver",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "ERC20InvalidSender",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "ERC20InvalidSpender",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
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
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
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
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
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
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }];

const erc20Contract = new web3.eth.Contract(contractABI, contractAddressERC20);
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

let users = [];
let posts = [];
fs.readFile(__dirname + '/data/users.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    users = JSON.parse(data);
}); 

fs.readFile(__dirname + '/data/posts.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    posts = JSON.parse(data);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.post('/register', (req, res) => {
    const { username, fullName, email, password } = req.body;
    if (users.find(u => u.username === username)) {
        res.status(400).send('Username already exists');
        return;
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    users.push({ username, fullName, email, password: hashedPassword, friends: [], walletAddress: "", friendRequests: [], avatarURL: "" });
    fs.writeFile(__dirname + '/data/users.json', JSON.stringify(users), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving user data');
            return;
        }
        res.redirect('/login');
    });
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        res.status(401).send('Invalid username or password');
        return;
    }
    req.session.user = username;
    res.redirect('/profile');
});

app.get('/profile', (req, res) => {
    const user = req.session.user;
    if (!user) {
        res.redirect('/login');
        return;
    }
    const userData = users.find(u => u.username === user);
    if (!userData) {
        res.status(404).send('User not found');
        return;
    } 
    res.sendFile(__dirname + '/public/profile.html');
});
  
app.get('/profile/:username', (req, res) => {
    const user = req.session.user;
    const { username } = req.params;
    if (!user) {
        res.redirect('/login'); 
        return;
    }

    if (user == username) {
        res.redirect('/profile');
    }

    const userData = users.find(u => u.username === username);
    if (!userData) {
        res.status(404).send('User not found');
        return;
    }
    res.sendFile(__dirname + '/public/userProfile.html');
});
  
app.get('/profileData', (req, res) => {
    const user = req.session.user;
    if (!user) {
        res.status(401).send('Unauthorized');
        return;
    }
    const userData = users.find(u => u.username === user);
    if (!userData) {
        res.status(404).send('User not found');
        return;
    }
    res.json(userData);
});
  
app.get('/profileData/:username', (req, res) => {
    const user = req.session.user;
    const { username } = req.params;
    if (!user) {
        res.status(401).send('Unauthorized');
        return;
    }
    const userData = users.find(u => u.username === username);
    if (!userData) {
        res.status(404).send('User not found');
        return;
    }
    res.json(userData);
});
  
// app.post('/updateAvatar', (req, res) => {
//     console.log(req.body);
//     const { username, avatar } = req.body;
//
//     const user = users.find(u => u.username === username);
//
//     if (!user) {
//         console.log(username);
//         res.status(404).send('User not found');
//         return;
//     }
//
//     user.avatar = avatar;
//
//     fs.writeFile(__dirname + '/data/users.json', JSON.stringify(users), (err) => {
//         if (err) {
//             console.error(err);
//             res.status(500).send('Error saving user data');
//             return;
//         }
//         console.log(`Wallet address updated for ${username}: ${avatar}`);
//         res.sendStatus(200);
//     });
// });
  
app.post('/updateWalletAddress', async (req, res) => {
    const { username, address } = req.body;

    const user = users.find(u => u.username === username);

    if (!user) {
        console.log(username);
        res.status(404).send('User not found');
        return;
    }

    user.walletAddress = address;

    fs.writeFile(__dirname + '/data/users.json', JSON.stringify(users), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving user data');
            return;
        }
        console.log(`Wallet address updated for ${username}: ${address}`);
        res.sendStatus(200);
    });
});
  
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});
  
app.post('/add-friend', (req, res) => {
    const { friendUsername } = req.body;

    // Ensure current user is authenticated
    const currentUser = req.session.user;
    if (!currentUser) {
        return res.status(401).send('Unauthorized');
    }

    // Validate friend username exists and is not the same as the current user
    const friend = users.find(user => user.username === friendUsername);
    if (!friend || friend.username === currentUser) {
        return res.status(400).send('Invalid friend username');
    }

    // Check if friend request already exists
    const existingRequest = friend.friendRequests.find(request => request.from === currentUser);
    if (existingRequest) {
        return res.status(400).send('Friend request already sent');
    }

    // Check if friends already
    if (friend.friends.includes(currentUser) && currentUser.friends.includes(friendUsername)) {
        return res.status(400).send('Already friends');
    }

    // Send friend request
    friend.friendRequests.push({ from: currentUser });

    // Update users.json file
    fs.writeFile(__dirname + '/data/users.json', JSON.stringify(users), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving user data');
            return;
        }
        console.log(`Friend request sent from ${currentUser} to ${friendUsername}`);
        res.sendStatus(200);
    });
});
  
app.post('/friend-request/:action/:username', (req, res) => {
    const { action } = req.params;
    const { username } = req.params; // Предполагается имя пользователя друга, отправившего запрос

    // Проверка аутентификации текущего пользователя
    const currentUser = req.session.user;
    if (!currentUser) {
        return res.status(401).send('Unauthorized');
    }

    // Проверка имени пользователя
    const friend = users.find(user => user.username === username);
    if (!friend) {
        return res.status(400).send('Invalid friend username');
    }

    // Подтверждение наличия запроса
    const friendRequest = friend.friendRequests.find(request => request.from === username);
    if (!friendRequest) {
        return res.status(400).send('No friend request found');
    }

    // Проверка действия
    if (action !== 'accept' && action !== 'reject') {
        return res.status(400).send('Invalid action');
    }

    // Обработка запроса в зависимости от действия:
    if (action === 'accept') {
        // Добавление друзей в списки друг друга
        currentUser.friends.push(username);
        friend.friends.push(currentUser);

        // Удаление запроса из списка друзей
        friend.friendRequests.splice(friend.friendRequests.indexOf(friendRequest), 1);

        // Обновление users.json
        fs.writeFile(__dirname + '/data/users.json', JSON.stringify(users), (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error saving user data');
                return;
            }
            console.log(`${currentUser} и ${username} теперь друзья`);
            res.sendStatus(200);
        });
    } else { // action === 'reject'
        // Удаление запроса из списка друзей
        friend.friendRequests.splice(friend.friendRequests.indexOf(friendRequest), 1);

        // Обновление users.json
        fs.writeFile(__dirname + '/data/users.json', JSON.stringify(users), (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error saving user data');
                return;
            }
            console.log(`${currentUser} отклонил запрос на дружбу от ${username}`);
            res.sendStatus(200);
        });
    }
});
  
app.get('/posts/:username', (req, res) => {
    const { username } = req.params;
    const filteredPosts = posts.filter(post => post.username === username)
    res.json(filteredPosts);
});
  
  
app.get('/posts/', (req, res) => {
    const user = req.session.user;
    res.json(posts);
});

app.post('/posts', requireAuth, async (req, res) => {
    const user = req.session.user;
    const userInfo = users.find(u => u.username === user);
    const walletAddress = userInfo.walletAddress;
    const userName = userInfo.username;

    // Проверка баланса ERC-721 токенов
    const erc721Balance = await nftContract.methods.balanceOf(walletAddress).call();
    if (erc721Balance === 0n) {
        res.status(400).send('You dont have NFT');
        return;
    }

    const { postTitle, postBody } = req.body;

    const id = posts.length + 1;
    posts.push({ id, userName, postTitle, postBody, comments: [] });

    fs.writeFile(__dirname + '/data/posts.json', JSON.stringify(posts), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving post data');
            return;
        }

        res.sendStatus(200);
    });
});

app.post('/posts/comment/:id', async (req, res) => {
    const user = req.session.user;
    if (!user) {
        res.redirect('/login');
        return;
    }
    const {id} = req.params;
    const {comment} = req.body;
    const userInfo = users.find(u => u.username === user);
    const walletAddress = userInfo.walletAddress;
    console.log(id);
    // Проверка баланса ERC-721 токенов
    const erc721Balance = await nftContract.methods.balanceOf(walletAddress).call();
    if (erc721Balance === 0n) {
        res.status(400).send('You dont have NFT');
        return;
    }
    const post = posts.find(p => p.id == id);
    post.comments.push({username: user, commentBody: comment});

    fs.writeFile(__dirname + '/data/posts.json', JSON.stringify(posts), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving post data');
            return;
        }
    });
});
  
  
app.get('/users', (req, res) => {
    res.json(users);
});
  
app.post('/updateAvatar', (req, res) => {
    const { avatarURL } = req.body;
    console.log(req.session);
    const user = req.session.user;
  
    console.log(user, "ssiu");
    const userInfo = users.find(u => u.username === user);
          
  
    userInfo.avatarURL = avatarURL;
  
    fs.writeFile(__dirname + '/data/users.json', JSON.stringify(users), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving user data');
            return;
        }
        console.log(`Avatar URL updated for ${userInfo}: ${avatarURL}`);
        res.sendStatus(200);
    });
});

app.get('/updateTokens', async (req, res) => {
    const user = req.session.user;
    const userInfo = users.find(u => u.username === user);
    const walletAddress = userInfo.walletAddress;
    let erc721Balance; // Объявление переменной без присваивания значения

    try {
        erc721Balance = await nftContract.methods.balanceOf(walletAddress).call();
        console.log('Friends length:', userInfo.friends.length);
        console.log('ERC721 Balance:', erc721Balance);
        if (userInfo.friends.length > 4 && erc721Balance === 0n) {
            const gasPrice = await web3.eth.getGasPrice();

            const nonce = await web3.eth.getTransactionCount(fromAddress);

            const txData = nftContract.methods.mintNFT(walletAddress).encodeABI();
            const gasLimit = 300000; // Установите подходящий лимит газа

            const signedTx = await web3.eth.accounts.signTransaction({
                to: contractAddress,
                data: txData,
                gas: gasLimit,
                gasPrice: gasPrice,
                nonce: nonce,
            }, privateKey);

            const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log(`NFT minted! Transaction hash: ${txHash}`);
        }

        // Получение баланса ERC20
        const erc20Balance = await erc20Contract.methods.balanceOf(walletAddress).call();

        // Получение баланса ERC721
        erc721Balance = await nftContract.methods.balanceOf(walletAddress).call();

        res.json({
            walletAddress: walletAddress,
            erc20Balance: erc20Balance.toString(),
            erc721Balance: erc721Balance.toString()
        });
    } catch (error) {
        console.error('Error getting balances:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

function requireAuth(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to log in to access this page');
        res.redirect('/login');
    }
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});