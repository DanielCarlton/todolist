const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const mongoose = require('mongoose');

// Remove warning. "DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead."
mongoose.set('useCreateIndex', true);

const app = express();

// Load routes
const tasks = require('./routes/tasks');
const users = require('./routes/users');

// Passport Config
require('./config/passport')(passport);

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

// Express session middleware
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash middleware
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
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
