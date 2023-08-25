/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        fontFamily: {
            jakarta: ["Plus Jakarta Sans"],
        },
        extend: {
            colors: {
                backgroundGrey: "#FAFAFA",
                primary: "#4356E0",
            },
        },
    },
    plugins: [],
};
