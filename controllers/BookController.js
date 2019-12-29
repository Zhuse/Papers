const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
const mongoose = require('mongoose');
const Book = require('../models/BookModel');
const apiResponse = require('../helpers/apiResponse');
const auth = require('../middlewares/jwt');

mongoose.set('useFindAndModify', false);

// Book Schema
function BookData(data) {
  this.id = data._id;
  this.title = data.title;
  this.description = data.description;
  this.isbn = data.isbn;
  this.createdAt = data.createdAt;
}

/**
 * Book List.
 *
 * @returns {Object}
 */
exports.bookList = [
  auth,
  function (req, res) {
    try {
      Book.find({ user: req.user._id }, '_id title description isbn createdAt').then((books) => {
        if (books.length > 0) {
          return apiResponse.successResponseWithData(res, 'Operation success', books);
        }
        return apiResponse.successResponseWithData(res, 'Operation success', []);
      });
    } catch (err) {
      // throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Book Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.bookDetail = [
  auth,
  function (req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return apiResponse.successResponseWithData(res, 'Operation success', {});
    }
    try {
      Book.findOne({ _id: req.params.id, user: req.user._id }, '_id title description isbn createdAt').then((book) => {
        if (book !== null) {
          const bookData = new BookData(book);
          return apiResponse.successResponseWithData(res, 'Operation success', bookData);
        }
        return apiResponse.successResponseWithData(res, 'Operation success', {});
      });
    } catch (err) {
      // throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Book store.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.bookStore = [
  auth,
  body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
  body('description', 'Description must not be empty.').isLength({ min: 1 }).trim(),
  body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim().custom((value, { req }) => Book.findOne({ isbn: value, user: req.user._id }).then((book) => {
    if (book) {
      return Promise.reject('Book already exist with this ISBN no.');
    }
  })),
  sanitizeBody('*').escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      const book = new Book(
        {
          title: req.body.title,
          user: req.user,
          description: req.body.description,
          isbn: req.body.isbn,
        },
      );

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, 'Validation Error.', errors.array());
      }
      // Save book.
      book.save((err) => {
        if (err) { return apiResponse.ErrorResponse(res, err); }
        const bookData = new BookData(book);
        return apiResponse.successResponseWithData(res, 'Book add Success.', bookData);
      });
    } catch (err) {
      // throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Book update.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.bookUpdate = [
  auth,
  body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
  body('description', 'Description must not be empty.').isLength({ min: 1 }).trim(),
  body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim().custom((value, { req }) => Book.findOne({ isbn: value, user: req.user._id, _id: { $ne: req.params.id } }).then((book) => {
    if (book) {
      return Promise.reject('Book already exist with this ISBN no.');
    }
  })),
  sanitizeBody('*').escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      const book = new Book(
        {
          title: req.body.title,
          description: req.body.description,
          isbn: req.body.isbn,
          _id: req.params.id,
        },
      );

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, 'Validation Error.', errors.array());
      } if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return apiResponse.validationErrorWithData(res, 'Invalid Error.', 'Invalid ID');
      }
      Book.findById(req.params.id, (err, foundBook) => {
        if (foundBook === null) {
          return apiResponse.notFoundResponse(res, 'Book not exists with this id');
        }
        // Check authorized user
        if (foundBook.user.toString() !== req.user._id) {
          return apiResponse.unauthorizedResponse(res, 'You are not authorized to do this operation.');
        }
        // update book.
        Book.findByIdAndUpdate(req.params.id, book, {}, (err) => {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          }
          const bookData = new BookData(book);
          return apiResponse.successResponseWithData(res, 'Book update Success.', bookData);
        });
      });
    } catch (err) {
      // throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Book Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.bookDelete = [
  auth,
  function (req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return apiResponse.validationErrorWithData(res, 'Invalid Error.', 'Invalid ID');
    }
    try {
      Book.findById(req.params.id, (err, foundBook) => {
        if (foundBook === null) {
          return apiResponse.notFoundResponse(res, 'Book not exists with this id');
        }
        // Check authorized user
        if (foundBook.user.toString() !== req.user._id) {
          return apiResponse.unauthorizedResponse(res, 'You are not authorized to do this operation.');
        }
        // delete book.
        Book.findByIdAndRemove(req.params.id, (err) => {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          }
          return apiResponse.successResponse(res, 'Book delete Success.');
        });
      });
    } catch (err) {
      // throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
