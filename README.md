# MAS Detroit Scouts Subpage

This folder is ready to be added to the chapter website as a scouts subpage.

## Static page install

Copy these items into a new `/scouts/` folder on the website:

- `index.html`
- `css/styles.css`
- `js/main.js`
- `assets/`

Then add one menu item in the chapter website's permanent top menu:

- Label: `Scouts`
- URL: `/scouts/`

## CMS/theme install

If the chapter website is managed through a CMS or theme template:

1. Create a new page named `Scouts`.
2. Copy only the HTML from `<main id="scouts-page" class="scouts-page">` through the matching `</main>`.
3. Add `css/styles.css` to that page or enqueue it in the theme.
4. Add `js/main.js` at the bottom of that page or enqueue it in the theme footer.
5. Upload the `assets/` folder and keep the image paths matching the HTML and JavaScript.

### WordPress iframe embed

When embedding the hosted page in WordPress, do not use a fixed iframe height. The page reports its content height to the WordPress parent with `postMessage`; add this listener to the page containing the iframe (Elementor HTML widget or theme footer), and give the iframe the `scouts-embed` class:

```html
<iframe class="scouts-embed" src="https://mbateya.github.io/scouts_site/" title="MAS Detroit Scouts" style="width:100%;height:320px;border:0;display:block" scrolling="no"></iframe>
<script>
window.addEventListener('message', function (event) {
  if (event.origin !== 'https://mbateya.github.io') return;
  if (event.data?.type !== 'scouts-page:height') return;
  if (!Number.isFinite(event.data.height)) return;
  const frame = document.querySelector('.scouts-embed');
  if (frame && event.source === frame.contentWindow) {
    frame.style.height = `${Math.max(320, Math.ceil(event.data.height))}px`;
  }
});
</script>
```

The height message is sent again when the content or viewport changes, so the outer WordPress page remains the only vertical scroll area.

Do not copy a separate header, navigation, or footer from this scouts page. The chapter website should continue to own the permanent top menu and site footer.

## Notes

- All scouts page styling is scoped under `.scouts-page` so it does not intentionally style the rest of the website.
- The contact form submits to `https://formspree.io/f/mbgdqyoj`. Configure and verify `scouts@masdetroit.org` as the recipient in the Formspree dashboard; the recipient is managed there.
- JavaScript shows sending, success, and error states; failed submissions preserve the entered message. Without JavaScript, the form posts directly to Formspree.
- To verify delivery, submit a test from the local preview and check both the Formspree dashboard and the recipient inbox.
- The page uses Google Fonts in the `<head>` of `index.html`. If the chapter website already handles fonts, those font links can be omitted.

- The page covers Cub Scout Pack #2023 (1st–5th grade) and Scouts BSA Troop #2023 (6th grade and above), with separate registration links.
- The troop charter is included at `assets/troop-2023-charter.pdf`; upload this file with the other assets.
- The embedded calendar currently covers the pack; troop meeting details are available by contacting the leadership team.
