/**
 * 404 not Found Handling Middleware
 */
function notFoundHandler(req, res) {
  res.status(404).send('Sorry cant find that!');
}

module.exports = notFoundHandler;