# Existing document and presentation tools

These files previously lived in the workspace root. They were moved here together with their original `package.json`, lockfile, and `node_modules/`, keeping document-generation dependencies separate from the React app.

`workspace-path.js` resolves inputs and outputs against the main OCAADS workspace. The tools can therefore be called from this folder or the workspace root without putting generated documents inside the source tree. The old absolute `/mnt/f/ocaads/...` output path was also removed.

## Non-writing checks

From this folder:

```bash
node validate_pdf.js
node validate_template_pdf.js
python3 checkpdfmods.py
```

The PDF validators report basic file structure; they are not visual/content reviews. The Python utility only reports whether optional PDF modules are installed. The legacy `npm test` is the original “no test specified” placeholder, not an application test suite.

## Document generation — overwrites existing outputs

Run these **only when you intend to regenerate the corresponding document**:

```bash
node build_ocaads_codeswift_pdf.js  # overwrites workspace/OCAADS_CodeSwift_Submission.pdf
node build_ocaads_template_pdf.js  # overwrites the SAME PDF, using local template pages
node build_ocaads_deck.js          # overwrites workspace/OCAADS_Project_Overview.pptx
node fill_part2.js                # overwrites workspace/ppt/pdf-ppt_part2_filled.pptx
```

The template PDF generator retains its existing dependency on locally extracted template pages under the workspace's `.opencode/` folder. Those assets are local agent state, not a portable or published application dependency. This layout change does not make that generator self-contained. Do not copy or commit private attachments to fix it without authorization.

No document generation is needed to run the application. If document-tool dependencies need reinstalling, use `npm ci` **in this folder**, not in the workspace root.
