// Explicit, empty PostCSS config. This project uses plain CSS (no Tailwind), and
// declaring a local config stops PostCSS from walking UP the directory tree and
// picking up an unrelated parent config that expects tailwindcss.
export default { plugins: {} };
