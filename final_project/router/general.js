const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    //Write your code here
    console.log("Register endpoint hit");
    const username = req.body.username;
    const password = req.body.password;
    console.log(`Username: ${username}, Password: ${password}`);

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
    });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  new Promise((resolve, reject) => {
    // Simulate asynchronous fetching of books (you can replace this with actual async operations)
    if (books) {
      resolve(books);  // Resolve with the books data if available
    } else {
      reject("Error fetching books.");  // Reject if something goes wrong
    }
  })
  .then((booksData) => {
    // Send the books data in the response with proper formatting
    res.send(JSON.stringify(booksData, null, 4));
  })
  .catch((error) => {
    // If an error occurs, send a 500 status and the error message
    res.status(500).send(error);
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Retrieve the ISBN parameter from the request URL and send the corresponding book's details
    const ISBN = req.params.isbn;

    new Promise((resolve, reject) => {
        
        if (books[ISBN]) {
            resolve(books[ISBN]) //sends the book if ISBN is found in list
        } else {
            reject("Book not found with the given ISBN.") //handles error if book is not in list
        };})
        .then((book) => {
            res.send(book)
        })
        .catch((error)=> {
            res.status(404).send(error);
        });
    });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // Retrieve the author parameter from the request URL
  const authorName = req.params.author.toLowerCase(); // Convert to lowercase for case-insensitive matching

  // Filter books to find those by the given author
  new Promise((resolve, reject) => {
    const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === authorName);

    // Check if any books were found and respond accordingly
    if (booksByAuthor.length > 0) {
        resolve(booksByAuthor);
    } else {
        reject("No books found by the given author.");
    }
    })
    .then ((booksByAuthor) => {
        res.send(booksByAuthor);
    })
    .catch((error)=> {
        res.status(404).send(error);
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  // Retrieve the title parameter from the request URL
  const titleName = req.params.title.toLowerCase(); // Convert to lowercase for case-insensitive matching

  // Filter books to find those by the given title
  new Promise((resolve, reject) => {
    const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === titleName);

    // Check if any books were found and respond accordingly
    if (booksByTitle.length > 0) {
        resolve(booksByTitle);
    } else {
        reject("No books found by the given title.");
    }
    })
    .then ((booksByTitle)=> {
        res.send(booksByTitle);
    })
    .catch((error) => {
        res.status(404).send(error);
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Retrieve the ISBN parameter from the request URL and send the corresponding book's review
  const ISBN = req.params.isbn;
  if (books[ISBN]) {
      res.send(books[ISBN].reviews) //sends the book review if ISBN is found in list
  } else {
      res.status(404).send("Book not found with the given ISBN.") //handles error if book is not in list
  };
});

module.exports.general = public_users;
