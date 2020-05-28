const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book")

//Get All Authors
router.get("/", async (req, res) => {

  let searchOptions = {};
  if(req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i")
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/index", {authors: authors, searchOptions: req.query})
  } catch (err) {
    res.redirect("/")
  }
});


//New Author
router.get("/new", (req, res) => {
  res.render("authors/new", {author: new Author()})
});


//Create Author
router.post("/", async (req, res) => {
  const { name, email } = req.body;

  const author = new Author({
    name,
    email
  })

  try {
    await author.save();
    res.redirect(`authors/${author.id}`)
  } catch (err) {
    res.render("authors/new", {author: author, errorMessage: "Error Creating Author"})
  }
});

//SHow page: for a particular Author
router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    const books = await Book.find({ author: author.id }).limit(6).exec()
    res.render("authors/show", {author: author, booksByAuthor: books})
  } catch (err) {
    console.error(err)
    res.redirect("/")
  }
})

//Edit page
router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    res.render("authors/edit", {author: author})
  } catch (err) {
    res.redirect("/authors");
  }
})

//Update Route
router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id)
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${author.id}`)
  } catch (err) {
    if(!author) {
      res.redirect("/")
    } else {
      res.render("authors/edit", {author: author, errorMessage: "Error Updating Author"})
    }
  }
})

//Delete Author route
router.delete("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id)
    await author.remove();
    res.redirect("/authors")
  } catch (err) {
    if(!author) {
      res.redirect("/")
    } else {
      res.redirect(`/authors/${author.id}`)
    }
  }
})

module.exports = router;