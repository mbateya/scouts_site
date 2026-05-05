# MAS Detroit Scouts Subpage

This folder is ready to be added to the chapter website as a scouts subpage.

## Static page install

Copy these items into a new `/scouts/` folder on the website:

- `index.html`
- `css/styles.css`
- `js/main.js`
- `assets/`

Then add one menu item in the chapter website's permanent top menu:

- Label: `Cub Scouts`
- URL: `/scouts/`

## CMS/theme install

If the chapter website is managed through a CMS or theme template:

1. Create a new page named `Cub Scouts`.
2. Copy only the HTML from `<main id="scouts-page" class="scouts-page">` through the matching `</main>`.
3. Add `css/styles.css` to that page or enqueue it in the theme.
4. Add `js/main.js` at the bottom of that page or enqueue it in the theme footer.
5. Upload the `assets/` folder and keep the image paths matching the HTML and JavaScript.

Do not copy a separate header, navigation, or footer from this scouts page. The chapter website should continue to own the permanent top menu and site footer.

## Notes

- All scouts page styling is scoped under `.scouts-page` so it does not intentionally style the rest of the website.
- The contact form opens the visitor's email client with a message addressed to `scouts@masdetroit.org`.
- The page uses Google Fonts in the `<head>` of `index.html`. If the chapter website already handles fonts, those font links can be omitted.
