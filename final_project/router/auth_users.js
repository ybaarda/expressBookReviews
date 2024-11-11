const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    const userMatches = users.filter((user) => user.username === username);
        return userMatches.length > 0;
    }

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.username;
  if (books[isbn]) {
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    res.status(200).json({
        message: 'Review added/updated succesfully',
        reviews: books[isbn].reviews
    });
  } else {
    res.status(404).json({message:"Book not found with the given ISBN"});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from the URL
    const username = req.session.username; // Get the logged-in user from the session

    // Check if the book exists
    if (books[isbn]) {
        // Check if reviews exist for the book
        if (books[isbn].reviews && books[String(isbn)].reviews[username]) {
        // Delete the user's review
        delete books[isbn].reviews[username];

        res.status(200).json({
            message: "Review deleted successfully",
            reviews: books[isbn].reviews
        });
        } else {
        res.status(404).json({
            message: "Review not found for the given user"
        });
        }
    } else {
        res.status(404).json({
        message: "Book not found with the given ISBN"
        });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
