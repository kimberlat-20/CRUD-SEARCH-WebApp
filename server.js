const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./database');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

/* REGISTER */
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run("INSERT INTO users (username, password) VALUES (?,?)", [username, hash], () => {
    res.send({ message: "Registered" });
  });
});

/* LOGIN */
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username=?", [username], async (err, user) => {
    if (!user) return res.send({ error: "User not found" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.send({ error: "Wrong password" });
    res.send({ success: true });
  });
});

/* GET ALL BOOKS */
app.get('/books', (req, res) => {
  db.all("SELECT * FROM books", (err, rows) => {
    res.send(rows);
  });
});

/* ADD BOOK */
app.post('/books', (req, res) => {
  const { title, author, genre } = req.body;
  db.run("INSERT INTO books (title, author, genre) VALUES (?,?,?)", [title, author, genre], () => {
    res.send({ message: "Book added" });
  });
});

/* DELETE BOOK */
app.delete('/books/:id', (req, res) => {
  db.run("DELETE FROM books WHERE id=?", [req.params.id], () => {
    res.send({ message: "Book deleted" });
  });
});

/* UPDATE BOOK */
app.put('/books/:id', (req, res) => {
  const { title, author, genre } = req.body;
  db.run("UPDATE books SET title=?, author=?, genre=? WHERE id=?", [title, author, genre, req.params.id], () => {
    res.send({ message: "Book updated" });
  });
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
