const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');

const app = express();

// Connect to mongo db
mongoose
  .connect('mongodb://tasklistuser:zxcasd2@ds157895.mlab.com:57895/tasklist', {
    useNewUrlParser: true
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Load task model
require('./models/Task');
const Task = mongoose.model('tasks');

// Handlebars middleware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method Override middleware
app.use(methodOverride('_method'));

// Session middleware
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Flash middleware
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Index Route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title: title
  });
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

// Tasks index page
app.get('/tasks', (req, res) => {
  Task.find({})
    .sort({ date: 'descending' })
    .then(tasks => {
      res.render('tasks/index', {
        tasks: tasks
      });
    })
    .catch(err => console.log(err));
});

// Process Form
app.post('/tasks', (req, res) => {
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
    const newUser = {
      title: req.body.title,
      details: req.body.details
    };
    new Task(newUser)
      .save()
      .then(task => {
        req.flash('success_msg', 'Task added');
        res.redirect('/tasks');
      })
      .catch(err => console.log(err));
  }
});

// Add Task Form
app.get('/tasks/add', (req, res) => {
  res.render('tasks/add');
});

// Edit Task Form
app.get('/tasks/edit/:id', (req, res) => {
  Task.findOne({
    _id: req.params.id
  }).then(task => {
    res.render('tasks/edit', {
      task: task
    });
  });
});

// Edit Task process
app.put('/tasks/:id', (req, res) => {
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
app.delete('/tasks/:id', (req, res) => {
  Task.deleteOne({ _id: req.params.id }).then(() => {
    req.flash('success_msg', 'Task removed');
    // res.redirect('/tasks');
  });
});

const port = 5000;

app.listen(port, () => console.log(`Listening on port ${port}`));
