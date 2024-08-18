const withMT = require("@material-tailwind/react/utils/withMT");
const flowbite = require("flowbite-react/tailwind");
/* @type {import('tailwindcss').Config} */

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {

      colors: {
        primary: '#D3D3D3',
        back:'rgb(242,242,242)'
      },

    },
  },
  plugins: [
    flowbite.plugin(),
  ],

});