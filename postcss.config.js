module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
  variants: {
    opacity: ({ after }) => after(['disabled'])
  },

}
