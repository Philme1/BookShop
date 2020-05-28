const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");
const imageMimeTypes =["image/jpeg", "image/png", "images/gif"];


//Get All Books
router.get("/", async (req, res) => {
  let query = Book.find();
  // console.log(query);
  if(req.query.title != null && req.query.title !== "") {
    query = query.regex("title", new RegExp(req.query.title, "i"))
  }
  if(req.query.publishedBefore != null && req.query.publishedBefore !== "") {
    query = query.lte("publishDate", req.query.publishedBefore)
  }
  if(req.query.publishedAfter != null && req.query.publishedAfter !== "") {
    query = query.gte("publishDate", req.query.publishedAfter)
  }
  try {
    const books = await query.exec()
    res.render("books/index", {books: books, searchOptions: req.query}) 
  } catch (err) {
    res.redirect("/")
  }
});


//New Book
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});


//Create Book
router.post("/", async (req, res) => {
  const { title, author, pageCount, description, publishDate } = req.body;
  const book = new Book({
    title,
    author,
    pageCount,
    description,
    publishDate: new Date(publishDate)
  });

  saveCover(book, req.body.cover);

  try {
    await book.save();
    res.redirect(`books/${book.id}`)
  } catch (err) {
    renderNewPage(res, book, true);
  }
});

//Show Page
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    res.render("books/show", {book: book})
  } catch (err) {
    res.redirect('/')
  }
})

//Edit Page;
router.get("/:id/edit", async (req, res) => {
  try {
   const book = await Book.findById(req.params.id)
   renderEditPage(res, book)
  } catch (err) {
    res.redirect("/")
  }
})


//Update Route
router.put("/:id", async (req, res) => {
  const { title, author, pageCount, description, publishDate } = req.body;
   let book;

  try {
    book = await Book.findById(req.params.id)
    book.title = title
    book.author = author
    book.publishDate = new Date(publishDate)
    book.pageCount = pageCount
    book.description = description
    if(req.body.cover != null && req.body.cover !== "") {
      saveCover(book, req.body.cover)
    }
    await book.save();
    res.redirect(`/books/${book.id}`)
  } catch (err) {
    if(!book) {
      renderEditPage(res, book, true)
    } else {
      res.redirect("/")
    }
  }
});


//Delete Route
router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id)
    await book.remove()
    res.redirect("/books");
  } catch (err) {
    if(book != null) {
      res.render("books/show", {book: book, errorMessage: "Could not remove Book"})
    } else {
      res.redirect("/")
    }
  }
})

//=========================FUNCTIONS=========================================================
const renderNewPage = async (res, book, hasError = false) => {
  renderFormPage(res, book, "new", hasError)
}


const renderEditPage = async (res, book, hasError = false) => {
  renderFormPage(res, book, "edit", hasError)
}


const renderFormPage = async (res, book, form, hasError = false) => {
  try {
    const authors = await Author.find({})
    const params = {authors: authors, book: book}
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Book'
      } else {
        params.errorMessage = 'Error Creating Book'
      }
    }
    res.render(`books/${form}`, params)
  } catch {
    res.redirect('/books')
  }
}


const saveCover = (book, coverEncoded) => {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }
}

module.exports = router;