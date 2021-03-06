import express from 'express';
import path from 'path';
import getAllPages from './lib/getAllPages';
import ssrV2 from './src/ssr/staticRender/ssrV2';
import ssrReactive from './src/ssr/reactiveRender/ssr';

// components for render
import Home from './src/sections/Home';
import Post from './src/sections/Post';

const app = express();

// read the content directory
const listPages = getAllPages();

// this allow the html file sent to the client to get files
// like stylesheets or js
app.use(express.static(path.join(__dirname, '/assets')));

// render page with list of posts
//
app.get('/', async (req, res) => {
  // render our HTML file
  const finalHtml = await ssrV2({
    content: listPages.pageTitles,
    Component: Home,
  });

  res.setHeader('Cache-Control', 'assets, max-age=604800');
  res.send(finalHtml);
});

app.get('/reactive_page', (req, res) => {
  // render Home Reactive component
  //include js file which also contains Redux
  const finalHTML = ssrReactive(listPages);
  res.send(finalHTML);
});

// get a post html with the specific md file
//
app.get('/posts/:postTitle', async (req, res) => {
  console.log('is running post path');
  // get post content
  const titlePost = req.params.postTitle;
  const postContent = listPages.fullPages[titlePost].content;

  // render our HTML file
  const finalHtml = await ssrV2({ htmlContent: postContent, Component: Post });

  res.setHeader('Cache-Control', 'assets, max-age=604800');
  res.send(finalHtml);
});

// get the data from the md files
//
app.get('/pagesData', (req, res) => {
  res.send(listPages);
});

module.exports = app;
