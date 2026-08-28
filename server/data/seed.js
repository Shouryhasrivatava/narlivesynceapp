const fs = require('fs');
const path = require('path');

const seedDataPath = path.join(__dirname, 'posts.json');

const defaultPosts = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

module.exports = {
  defaultPosts,
  getSeedPosts: () => JSON.parse(JSON.stringify(defaultPosts))
};
