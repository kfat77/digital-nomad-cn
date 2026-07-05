I need to generate a compact JavaScript execute code to deploy this minified HTML to Cloudflare Pages.

The HTML content is about 12.7KB. I'll:
1. Escape the HTML for JavaScript string embedding
2. Use a single string variable in the execute code
3. Compute SHA-256 in the execute code
4. Construct multipart/form-data
5. Send POST to Pages deployment API

Let me do this with Python.