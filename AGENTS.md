<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Satellite basemaps prefer the managed browser Static Maps key on credential-free HTTPS origins; the authenticated image proxy is a fallback only, because image tags cannot send bearer tokens and server keys may lack Static Maps access.
- Never label a Google satellite basemap as live imagery or infer vegetation measurements from it; acquisition dates and scientific metrics require an imported scene.
- Farm location reads and edits use the earliest saved location consistently, because a farm may have several location rows and imagery must match the coordinate editor.
