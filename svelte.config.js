// svelte.config.js
const sveltePreprocess = require('svelte-preprocess');

module.exports = {
  preprocess: sveltePreprocess({
    scss: {
      includePaths: ['src'],
      implementation: require('sass'),
      renderSync: true
    },
    postcss: {
      plugins: [
        require('autoprefixer')
      ]
    }
  }),
  compilerOptions: {
    // enable run-time checks when not in production
    dev: !production
  }
};

