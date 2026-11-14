# NubiBuilds build log

A sample document that touches **every** Markdown element the theme styles.

## Text styles

Plain text, **bold text**, *italic text*, ***bold and italic***, ~~struck through~~
and `inline code`. A line with a hard break follows.\
Escaped characters: \* \_ \# and an HTML entity &copy;.

### Links and images

- An [inline link](https://example.com "With a title")
- A [reference link][docs] and an autolink <https://code.visualstudio.com>
- An image: ![Terminal screenshot](./img/terminal.png)

[docs]: https://code.visualstudio.com/api/references/theme-color

## Lists

1. First ordered item
2. Second ordered item
   - Nested bullet
   - Another nested bullet
     1. Deep ordered item
3. Third ordered item

* Star bullet
+ Plus bullet

- [x] Palette locked
- [ ] Screenshots taken

## Quotes

> A block quote should be dim and italic.
>
> > Nested quotes stay readable, with `code` and **bold** inside.

> [!NOTE]
> GitHub-style alerts use their own colours in the preview.

## Code

Indented code block:

    npm run build && npm run check

Fenced block with a language:

```ts
export const answer: number = 42;
function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

```diff
- const alpha = 0.22;
+ const alpha = 0.15;
```

## Tables

| Token    | Colour   | Style  |
| :------- | :------: | -----: |
| Keyword  | `violet` | normal |
| Comment  | `dim`    | italic |

---

Footnote reference[^1] and inline <kbd>HTML</kbd> with <span class="x">attributes</span>.

[^1]: The footnote text.
