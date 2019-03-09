const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../helpers/auth');

// Load task model
require('../models/Task');
const Task = mongoose.model('tasks');

// Tasks index page
router.get('/', ensureAuthenticated, (req, res) => {
  Task.find({ user: req.user.id })
    .sort({ date: 'descending' })
    .then(tasks => {
      res.render('tasks/index', {
        tasks: tasks
      });
    })
    .catch(err => console.log(err));
});

// Process Form
router.post('/', ensureAuthenticated, (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({ text: 'Please enter a title for this task' });
  }
  if (!req.body.details) {
    errors.push({ text: 'Please enter task details' });
  }
  if (errors.length > 0) {
    res.render('tasks/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newTask = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    };
    new Task(newTask)
      .save()
      .then(task => {
        req.flash('success_msg', 'Task added');
        res.redirect('/tasks');
      })
      .catch(err => console.log(err));
  }
});

// Add Task Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('tasks/add');
});

// Edit Task Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Task.findOne({
    _id: req.params.id
  }).then(task => {
    if (task.user != req.user.id) {
      req.flash('error_msg', 'Not authorised');
      res.redirect('/tasks');
    } else {
      res.render('tasks/edit', {
        task: task
      });
    }
  });
});

// Edit Task process
router.put('/:id', ensureAuthenticated, (req, res) => {
  Task.findOne({
    _id: req.params.id
  }).then(task => {
    // new values
    task.title = req.body.title;
    task.details = req.body.details;

    task.save().then(task => {
      req.flash('success_msg', 'Task updated');
      res.redirect('/tasks');
    });
  });
});

// Delete Task process
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Task.deleteOne({ _id: req.params.id }).then(() => {
    req.flash('success_msg', 'Task removed');
    res.redirect('/tasks');
  });
});

module.exports = router;
