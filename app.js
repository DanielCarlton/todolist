const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');

const app = express();

// Load routes
const tasks = require('./routes/tasks');
const users = require('./routes/users');

// Connect to mongo db
mongoose
  .connect('mongodb://tasklistuser:zxcasd2@ds157895.mlab.com:57895/tasklist', {
    useNewUrlParser: true
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Handlebars middleware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

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

// Use routes
app.use('/tasks', tasks);
app.use('/users', users);

const port = 5000;

app.listen(port, () => console.log(`Listening on port ${port}`));
