'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag');

const router = express.Router();

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));
/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;
  const userId = req.user.id;

  let filter = {userId};

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{ 'title': re }, { 'content': re }];
  }

  if (folderId) {
    filter.folderId = folderId;
  }

  if (tagId) {
    filter.tags = tagId;
  }


  Note.find(filter)
    .populate('tags')
    .sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  console.log(userId);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findOne({ _id: id, userId })
    .populate('tags')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', async (req, res, next) => {
  try {
    const { title, content, folderId, tags } = req.body;
    const userId = req.user.id;

    /***** Never trust users - validate input *****/
    if (!title) {
      const err = new Error('Missing `title` in request body');
      err.status = 400;
      return next(err);
    }

    if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
      const err = new Error('The `folderId` is not valid');
      err.status = 400;
      return next(err);
    }

    if (folderId) {
      const result = await Folder.findById(folderId);
      if (!result || !result.userId.equals(userId)) {
        const err = new Error('The `folderId` is not valid');
        err.status = 400;
      return next(err);
      }
    }

    if (tags) {
      const badIds = tags.filter((tag) => !mongoose.Types.ObjectId.isValid(tag));
      if (badIds.length) {
        const err = new Error('The `tags` array contains an invalid `id`');
        err.status = 400;
        return next(err);
      }
    }
    if (tags) {
      if (!Array.isArray(tags)) {
        const err = new Error(' The `tags` property must be an array');
        err.status = 400;
        return next(err);
      }
      const badIds = tags.filter((tag) => !mongoose.Types.ObjectId.isValid(tag));
      if (badIds.length) {
        const err = new Error('The `tags` array contains an invalid `id`');
        err.status = 400;
        return next(err);
      }
    }


    if (tags) {
      for(let i=0; i < tags.length; i++) {
        const result = await Tag.findById(tags[i])
        if (!result || !result.userId.equals(userId)) {
          const err = new Error('The `tags` array contains an invalid id');
          err.status = 400;
          return next(err);
        } 
      }
    }



    const newNote = { title, content, folderId, tags, userId };
    if (newNote.folderId === '') {
      delete newNote.folderId;
    }


    const result = await Note.create(newNote)
    res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
  } catch(err) {
    next(err)
  }
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const toUpdate = {};
  const updateableFields = ["title", "content", "folderId", "tags"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (toUpdate.title === '') {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (toUpdate.folderId && !mongoose.Types.ObjectId.isValid(toUpdate.folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  if (toUpdate.tags) {
    if (!Array.isArray(toUpdate.tags)) {
      const err = new Error(' The `tags` property must be an array');
      err.status = 400;
      return next(err);
    }
    const badIds = toUpdate.tags.filter((tag) => !mongoose.Types.ObjectId.isValid(tag));
    if (badIds.length) {
      const err = new Error('The `tags` array contains an invalid `id`');
      err.status = 400;
      return next(err);
    }
  }

  if (toUpdate.folderId) {
    Folder.findById(toUpdate.folderId)
      .then(result => {
        if (!result || !result.userId.equals(userId)) {
          const err = new Error('The `folderId` is not valid');
          err.status = 400;
          return next(err);
        } else return;
      })
      .catch(err => {
        next(err);
      });
  }


if (toUpdate.tags) {
  toUpdate.tags.forEach(tag => {
    Tag.findById(tag)
      .then((result) => {
        if (!result || !result.userId.equals(userId)) {
          const err = new Error('The `tags` array contains an invalid id');
          err.status = 400;
          return next(err);
        } else return;
      })
      .catch(err => {
        next(err.message);
      });
  });
}

  Note
  .findOneAndUpdate({_id: id, userId}, toUpdate, { new: true })
  .then(result => {
    if (result) {
      res.json(result);
    } else {
      next();
    }
  })
  .catch(err => {
    next(err);
  });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findOneAndRemove({_id:id, userId})
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
