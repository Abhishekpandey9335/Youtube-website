// server.js
import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const app = express();
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Connect MongoDB
await mongoose.connect(MONGO_URI);

// Define User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
});
const User = mongoose.model('User', userSchema);

// Define ChatHistory schema
const chatSchema = new mongoose.Schema({
  userEmail: String,
  question: String,
  answer: String,
  createdAt: { type: Date, default: Date.now }
});
const ChatHistory = mongoose.model('ChatHistory', chatSchema);

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Serve static frontend (your html below)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Registration API
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, passwordHash });
  await user.save();
  res.json({ message: 'Registered successfully' });
});

// Login API
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'User not found' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(400).json({ error: 'Invalid password' });
  // Simple session simulation (for demo)
  res.json({ message: 'Login success', userName: user.name, userEmail: user.email });
});

// Chatbot API
app.post('/api/chatbot', async (req, res) => {
  const { email, question } = req.body;
  if(!email || !question) return res.status(400).json({ error: 'Missing fields' });

  // Call OpenAI chat completion
  try{
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: question }],
    });
    const answer = response.choices[0].message.content;

    // Save chat history
    const chat = new ChatHistory({ userEmail: email, question, answer });
    await chat.save();

    res.json({ answer });
  } catch(e) {
    res.status(500).json({error: 'AI service error'});
  }
});

// Serve your existing HTML static page from string (in practice, use static file)
app.get('/index.html', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Abhishek's Channel • Learn & Grow</title>
  <style>
    /* ... (copy your existing CSS styles here) ... */
/* For brevity, you can insert your full CSS styles here */
body{font-family:sans-serif;}
/* minimal styles to illustrate. Please add your styles */
  </style>
</head>
<body>
<header>
  <h1>Abhishek's Channel</h1>
</header>
<main>
  <div id="auth-section">
    <h2>Register</h2>
    <form id="registerForm">
      <input type="text" id="name" placeholder="Name" required />
      <input type="email" id="email" placeholder="Email" required />
      <input type="password" id="password" placeholder="Password" required minlength="5" />
      <button type="submit">Register</button>
      <p id="registerMessage"></p>
    </form>

    <h2>Login</h2>
    <form id="loginForm">
      <input type="email" id="loginEmail" placeholder="Email" required />
      <input type="password" id="loginPassword" placeholder="Password" required />
      <button type="submit">Login</button>
      <p id="loginMessage"></p>
    </form>
  </div>

  <div id="chatbotSection" style="display:none;">
    <h2>AI Chatbot</h2>
    <div id="chatlog" style="border:1px solid black; height:200px; overflow-y:scroll; padding:5px;"></div>
    <form id="chatForm">
      <input type="text" id="chatInput" placeholder="Ask your question..." required/>
      <button type="submit">Send</button>
    </form>
    <button id="logoutBtn">Logout</button>
  </div>
</main>

<script>
  let loggedUserEmail = null;

  // Register
  document.getElementById('registerForm').onsubmit = async e => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const res = await fetch('/api/register', {
      method: 'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({name, email, password})
    });
    const data = await res.json();
    document.getElementById('registerMessage').innerText = data.message || data.error || '';
  }

  // Login
  document.getElementById('loginForm').onsubmit = async e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const res = await fetch('/api/login', {
      method: 'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email, password})
    });
    const data = await res.json();
    if(data.message==='Login success'){
      loggedUserEmail = data.userEmail;
      document.getElementById('auth-section').style.display = 'none';
      document.getElementById('chatbotSection').style.display = 'block';
      addChatMessage('bot', 'Welcome! Ask me anything.');
    } else {
      document.getElementById('loginMessage').innerText = data.error || 'Login failed';
    }
  }

  // Chatbot send
  document.getElementById('chatForm').onsubmit = async e => {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const question = input.value.trim();
    if (!question) return;
    addChatMessage('user', question);
    input.value = '';
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: loggedUserEmail, question})
      });
      const data = await res.json();
      addChatMessage('bot', data.answer || 'Sorry, no response.');
    } catch {
      addChatMessage('bot', 'Error in chatbot communication.');
    }
  };

  // Logout
  document.getElementById('logoutBtn').onclick = () => {
    loggedUserEmail = null;
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('chatbotSection').style.display = 'none';
    document.getElementById('loginMessage').innerText = '';
    document.getElementById('registerMessage').innerText = '';
    clearChatMessages();
  };

  function addChatMessage(sender, text) {
    const div = document.createElement('div');
    div.textContent = (sender === 'user' ? "You: " : "AI: ") + text;
    document.getElementById('chatlog').appendChild(div);
    document.getElementById('chatlog').scrollTop = document.getElementById('chatlog').scrollHeight;
  }
  function clearChatMessages() {
    document.getElementById('chatlog').innerHTML = '';
  }
</script>

</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
