const router = require('express').Router();
const path = require('path');
const apiRoutes = require('./api');

router.use('/api', apiRoutes);


// Serve static files from React build directory
router.use(express.static(path.join(__dirname, '../../client/dist')));

// Serve the React front-end in production (SPA fallback)
router.use((req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

module.exports = router;