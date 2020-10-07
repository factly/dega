module.exports = {
  branches: 'master',
  repositoryUrl: 'https://github.com/factly/dega-studio',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/github',
  ],
};
