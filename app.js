require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const _ = require('lodash');  // Require lodash

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Express session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Define the post schema
const postSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Post = mongoose.model('Post', postSchema);

// Home route
app.get('/', async (req, res) => {
  try {
    const posts = await Post.find({});
    const homeContent = "Welcome to the blog website. Here you can find a collection of posts on various topics. Feel free to explore and read the content that interests you.";
    res.render('home', { title: 'Home', posts: posts, messages: res.locals.messages, _, homeContent });  // Pass lodash as _
  } catch (err) {
    req.flash('error', 'Error retrieving posts');
    res.redirect('/');
  }
});

// Compose route
app.get('/compose', (req, res) => {
  res.render('compose', { title: 'Compose', messages: res.locals.messages });
});

app.post('/compose', async (req, res) => {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postContent
  });

  try {
    await post.save();
    req.flash('success', 'Post published successfully');
    res.redirect('/');
  } catch (err) {
    req.flash('error', 'Error saving post');
    res.redirect('/compose');
  }
});

// Individual post route
app.get('/posts/:postId', async (req, res) => {
  const requestedPostId = req.params.postId;

  try {
    const post = await Post.findOne({ _id: requestedPostId });
    res.render('post', { title: post.title, content: post.content, messages: res.locals.messages });
  } catch (err) {
    req.flash('error', 'Error retrieving post');
    res.redirect('/');
  }
});

// About route
app.get('/about', (req, res) => {
  const aboutContent = "This is the about page content. Here you can provide some information about the blog, its purpose, and the author.";
  res.render('about', { title: 'About', messages: res.locals.messages, aboutContent });
});

// Contact route
app.get('/contact', (req, res) => {
  const contactContent = "This is the contact page content. You can provide your contact details or a contact form here.";
  res.render('contact', { title: 'Contact', messages: res.locals.messages, contactContent });
});

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('MONGODB_URI is not defined in the environment variables');
  process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
