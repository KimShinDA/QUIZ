[README.md](https://github.com/user-attachments/files/35471020/README.md)
# CCST Cybersecurity Quiz

A browser-based quiz using the questions and answer choices from the supplied CCST Cybersecurity Reviewer. It includes chapter selection, optional question shuffling, immediate incorrect-answer feedback, previous-question navigation, and a running score.

## Publish with GitHub Pages

1. Upload the files in this folder to the root of a GitHub repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)`, then save.
5. Open the Pages URL GitHub displays after deployment.

No build step or server is required. Keep `index.html`, `style.css`, `app.js`, and `questions.js` together in the published folder.

## Notes

- Choose a chapter or use all 179 questions.
- Multi-select answers are graded only when the full answer set matches.
- Matching and ordering questions remain included and are identified as such; the supplied reviewer gives these as a matching/order answer key rather than a single letter choice.
- Shuffle changes question order. The answer choices stay in their original order to preserve the reviewer’s form.

### Scoring note

The supplied reviewer marks matching and ordering questions with a separate answer table instead of full interactive matching pairs. Those questions are included, but their original matching/order layout cannot be faithfully auto-graded from the key; the quiz displays that limitation. Two questions are keyed as “None” and require leaving all choices unselected.
