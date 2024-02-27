const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');

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
  
app.post('/updateAvatar', (req, res) => {
    console.log(req.body);
    const { username, avatar } = req.body;

    const user = users.find(u => u.username === username);

    if (!user) {
        console.log(username);
        res.status(404).send('User not found');
        return;
    }

    user.avatar = avatar;

    fs.writeFile(__dirname + '/data/users.json', JSON.stringify(users), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving user data');
            return;
        }
        console.log(`Wallet address updated for ${username}: ${avatar}`);
        res.sendStatus(200);
    });
});
  
app.post('/updateWalletAddress', async (req, res) => {
    const { username, address } = req.body;

    const user = users.find(u => u.username === username);

    if (!user) {
        console.log(username);
        res.status(404).send('User not found');
        return;
    }

    user.walletAddress = address;
    await transferTokens(address, 1);

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
  
app.post('/posts/', (req, res) => {
    const user = req.session.user;
    const { postTitle, postBody} = req.body;
    if (!user) {
        res.redirect('/login');
        return;
    }
    let id = posts.length + 1;
    posts.push({ id, user, postTitle, postBody, comments: []});
    fs.writeFile(__dirname + '/data/posts.json', JSON.stringify(posts), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving post data');
            return;
        }
    });
});
  
app.post('/posts/comment/:id', (req, res) => {
    const user = req.session.user;
    const { id } = req.params;
    const { comment } = req.body;
    if (!user) {
        res.redirect('/login');
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
})


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});