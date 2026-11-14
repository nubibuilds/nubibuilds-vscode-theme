# Git states fixture

`setup.sh` creates a throwaway repository in `samples/git-states/repo/` with one
file per Git status, so the theme's Source Control colours can be checked.

```sh
bash samples/git-states/setup.sh
```

| File                 | Status                | Expected colour | Badge |
| -------------------- | --------------------- | --------------- | ----- |
| `modified.ts`        | modified              | amber           | M     |
| `staged-modified.ts` | modified (staged)     | amber           | M     |
| `added.ts`           | added (staged)        | green accent    | A     |
| `untracked.ts`       | untracked             | green accent    | U     |
| `deleted.ts`         | deleted               | coral           | D     |
| `staged-deleted.ts`  | deleted (staged)      | coral           | D     |
| `renamed.ts`         | renamed (staged)      | cyan            | R     |
| `conflict.ts`        | merge conflict        | violet          | !     |
| `ignored.log`        | ignored               | faint           | none  |
| `unchanged.ts`       | unchanged             | default text    | none  |

Open the created `repo/` folder itself in VS Code (File > Open Folder): the
Source Control view only picks up a repository at, or just below, the workspace
root. The folder is not part of the packaged extension. To reset, delete
`repo/` and run the script again.

Submodules are not created by the script; see `TESTING.md` for the manual step.
