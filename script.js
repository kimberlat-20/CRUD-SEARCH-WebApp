const api = "http://localhost:3000";
let editBookId = null;
window.booksData = [];

/* LOGIN */
function login() {
  fetch(api + "/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      username: document.getElementById("user").value,
      password: document.getElementById("pass").value
    })
  })
  .then(res => res.json())
  .then(d => {
    if(d.success) location.href = "books.html";
    else if(d.error) alert(d.error);
    else alert("Login failed");
  });
}

/* REGISTER */
function register() {
  fetch(api + "/register", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      username: document.getElementById("ruser").value,
      password: document.getElementById("rpass").value
    })
  }).then(() => {
    alert("Registered!");
    location.href = "index.html";
  });
}

/* ADD / UPDATE BOOK */
function addBook() {
  const title = document.getElementById("bookTitle").value;
  const author = document.getElementById("bookAuthor").value;
  const genre = document.getElementById("bookGenre").value;

  if(editBookId) {
    fetch(api + "/books/" + editBookId, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({title, author, genre})
    }).then(() => {
      alert("Book updated!");
      editBookId = null;
      location.href = "books.html";
    });
  } else {
    fetch(api + "/books", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({title, author, genre})
    }).then(() => {
      alert("Book added!");
      location.href = "books.html";
    });
  }
}

/* EDIT BOOK */
function editBook(id) {
  const book = window.booksData.find(b => b.id === id);
  if(!book) return;
  editBookId = id;
  localStorage.setItem("editBook", JSON.stringify(book));
  location.href = "addbook.html";
}

/* Load edit book if exists */
if(document.getElementById("bookTitle") && localStorage.getItem("editBook")) {
  const book = JSON.parse(localStorage.getItem("editBook"));
  document.getElementById("bookTitle").value = book.title;
  document.getElementById("bookAuthor").value = book.author;
  document.getElementById("bookGenre").value = book.genre;
  document.getElementById("saveBtn").innerText = "Update Book";
  editBookId = book.id;
  localStorage.removeItem("editBook");
}

/* LOAD BOOKS */
function loadBooks() {
  fetch(api + "/books")
    .then(res => res.json())
    .then(data => {
      window.booksData = data;
      renderBooksList(data); // list view
      renderBooksGrid(data); // grid view
    });
}

/* RENDER LIST VIEW */
function renderBooksList(data) {
  const list = document.getElementById("list");
  if(!list) return;
  list.innerHTML = "";
  if(data.length === 0){ 
    list.innerHTML = "<p>No books found.</p>"; 
    return; 
  }

  data.forEach(b => {
    const li = document.createElement("li");

    // Title
    const titleSpan = document.createElement("span");
    titleSpan.textContent = b.title;
    titleSpan.style.marginRight = "10px";
    li.appendChild(titleSpan);

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.onclick = () => editBook(b.id);
    li.appendChild(editBtn);

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.style.marginLeft = "5px";
    delBtn.onclick = () => del(b.id);
    li.appendChild(delBtn);

    list.appendChild(li);
  });
}

/* DELETE BOOK */
function del(id) {
  if(!confirm("Delete this book?")) return;
  fetch(`${api}/books/${id}`, {method:"DELETE"})
    .then(loadBooks);
}

/* SEARCH BOOK */
function searchBook() {
  const query = document.getElementById("search").value.toLowerCase();
  const filtered = window.booksData.filter(b => b.title.toLowerCase().includes(query));
  renderBooksList(filtered);
}

/* GRID VIEW */
function renderBooksGrid(data) {
  const container = document.getElementById("booksContainer");
  if(!container) return;
  container.innerHTML = "";
  data.forEach(b => {
    container.innerHTML += `
      <div class="book-box">
        <strong>${b.title}</strong>
        <p>Author: ${b.author}</p>
        <p>Genre: ${b.genre}</p>
        <button class="edit-btn" onclick="editBook(${b.id})">Edit</button>
        <button class="delete-btn" onclick="del(${b.id})">Delete</button>
      </div>
    `;
  });
}

/* INIT LOAD */
if(document.getElementById("booksContainer") || document.getElementById("list")) loadBooks();
