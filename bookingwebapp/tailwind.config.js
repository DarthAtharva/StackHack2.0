const flowbite = require("flowbite-react/tailwind");
/** @type {import('tailwindcss').Config} */


module.exports = {
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
};