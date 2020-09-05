module.exports = {
  branches: 'master',
  repositoryUrl: 'https://github.com/factly/kavach-web',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/github',
  ],
};
