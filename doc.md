| Key           | What it does                                                        |
| ------------- | ------------------------------------------------------------------- |
| `link`        | The URL. Required, obviously.                                       |
| `description` | The little tooltip you get on hover. Optional, skip it if you want. |
| `favicons`    | `true` and it pulls the icon from Google automatically.             |
| `icon`        | Path to your own image. Only used when `favicons` is `false`.       |

**How icons are picked, in order:** favicons first → local file next → otherwise the first letter of the name as a fallback.

**One gotcha:** paths are relative to `index.html`, not to the JSON. So `icons/gmail.png` works, `/icons/gmail.png` does NOT.

## **• settings:**

```json
"settings": {
  "theme":     "catppuccin",
  "alignment": "centered",
  "layout":    "vertical",
  "linkScale": 100,
  "linkWidth": 200
}
```

| Key | Options | Default |
|---|---|---|
| `theme` | `"dark"` · `"light"` · `"oled"` · `"catppuccin"` · `"nord"` · `"tokyonight"` · `"custom"` | `"dark"` |
| `alignment` | `"centered"` · `"left"` · `"right"` | `"centered"` |
| `layout` | `"horizontal"` · `"vertical"` · `"stacked"` | `"horizontal"` |
| `linkScale` | any number, `100` = normal | `100` |
| `linkWidth` | any number in pixels, omit for auto | auto |

### **• Layouts:**

**horizontal** groups stack on top of each other, tiles wrap left to right. Classic bookmark-bar vibe.

**vertical** groups sit side by side as columns, tiles stack top to bottom inside each. This is the one that looks like a dashboard.

**stacked** groups stack on top of each other AND tiles stack inside each group. Single column, top to bottom. Good for long lists or narrow windows.

### **• Alignment:**

**left** anchors everything to the left edge.
**centered** puts it all in the middle.
**right** anchors to the right edge. Works with all three layouts.

### **• linkScale:**

Shrinks or grows the tiles as a percentage of the default size. `70` makes everything 30% smaller, `150` makes it 50% bigger. Icons, padding, text, gaps — the whole tile scales together so the proportions stay right.

```json
"linkScale": 70
```

Group titles, tooltips, and the search bar don't scale. Otherwise at `50%` the headers would be bigger than the tiles themselves.

### **• linkWidth:**

Forces every tile to a fixed width in pixels. Omit it and tiles size themselves to their content.

```json
"linkWidth": 220
```

`linkScale` controls internal sizes (icons, text, padding). `linkWidth` controls the tile's total width. They're independent — you can do `"linkScale": 80, "linkWidth": 180` for small tiles in a fixed-width box.

### **Custom theme:**

If you don't like what i put in, you can make your own. Set `"theme": "custom"` and define your own colors:

```json
"settings": {
  "theme": "custom",
  "customTheme": {
    "bg":         "#0d0b1a",
    "fg":         "#e4dfff",
    "muted":      "#8a7fb8",
    "card":       "rgba(255,255,255,.05)",
    "card-hover": "rgba(255,255,255,.09)",
    "border":     "rgba(180,150,255,.18)",
    "accent":     "#b794f6",
    "tooltip":    "#1a1428",
    "tooltip-fg": "#e4dfff",
    "radius":     "16px"
  }
}
```

You can write the keys with or without the `--` in front. `"accent"` and `"--accent"` do the same.

| Variable     | What it colors                           |
| ------------ | ---------------------------------------- |
| `bg`         | The page background                      |
| `fg`         | The main text (foreground)               |
| `muted`      | Group titles, placeholder text           |
| `card`       | The tile background                      |
| `card-hover` | Tile background when you hover           |
| `border`     | Every border, everywhere                 |
| `accent`     | Focus glow, hover borders, the fun stuff |
| `tooltip`    | The hover tooltip background             |
| `tooltip-fg` | The hover tooltip text                   |
| `radius`     | How round the tiles are                  |

Anything extra you throw in there gets applied too, so if I ever add new variables down the line, they'll just work.

### **Background:**

A wallaper behind everything. Optional. Skip the whole block and you get the plain theme color.

```json
"background": {
  "image":    "wallpapers/mountain.jpg",
  "video":    "wallpapers/loop.mp4",
  "dim":      0.45,
  "blur":     6,
  "size":     "cover",
  "position": "center"
}
```

| Key | What it does | Default |
|---|---|---|
| `image` | Path to an image, or a URL, or a CSS gradient | — |
| `video` | Path to a video, or a URL. Takes priority over `image` if both are set | — |
| `dim` | Black overlay opacity, `0` to `1` | `0` |
| `blur` | Gaussian blur on the background only, in pixels | `0` |
| `size` | Any `background-size` value: `cover`, `contain`, `auto`, `100% 100%` | `cover` |
| `position` | Any `background-position`: `center`, `top left`, `50% 20%` | `center` |

If both `image` and `video` are set, the image acts as the **poster** — it shows while the video loads, and stays if the video fails.

**Video gotchas:**
- Keep loops short and small. Under 5 MB if you can. WebM compresses better than MP4.
- Autoplay only works if the video is muted. It already is, don't remove it.
- Don't combine `video` with heavy `blur`. CSS blur on a moving video re-runs every frame and will spin your fan. Pick one: moving OR blurred.
- Local files or full URLs both work.

**Gradients as backgrounds:** since `image` accepts any CSS value, this works:

```json
"background": {
  "image": "linear-gradient(135deg, #1a1a2e, #16213e)"
}
```

## **• search:**

```json
"search": {
  "enabled": true,
  "default": "Brave",
  "providers": {
    "Google":     "https://www.google.com/search?q=",
    "Brave":      "https://search.brave.com/search?q=",
    "DuckDuckGo": "https://duckduckgo.com/?q="
  }
}
```

| Key | What it does |
|---|---|
| `enabled` | Set to `false` and the whole search bar disappears. |
| `default` | Which provider is picked on first load. |
| `providers` | Name → URL prefix. The query gets appended and encoded for you. |

Your last choice is saved, so if you switch to Brave once it stays Brave forever. You're welcome.

**Adding your own:** any search URL that ends in `q=` works. Examples:

```json
"YouTube":   "https://www.youtube.com/results?search_query=",
"GitHub":    "https://github.com/search?q=",
"Wikipedia": "https://en.wikipedia.org/w/index.php?search="
```

**Sneaky feature:** if you type something that looks like a URL (`github.com`, `https://something.io`), it just opens it instead of searching. Saves you a click.

## Full example:

Here's one I typed up so you can just copy it and delete what you don't want:

```json
{
  "bookmarks": {
    "Social": {
      "YouTube": {
        "link": "https://youtube.com",
        "description": "Videos",
        "favicons": true
      },
      "Gmail": {
        "link": "https://mail.google.com",
        "favicons": false,
        "icon": "icons/gmail.png"
      }
    },
    "Dev": {
      "GitHub": {
        "link": "https://github.com",
        "description": "Where the code lives",
        "favicons": true
      }
    }
  },

  "settings": {
    "theme": "catppuccin",
    "alignment": "centered",
    "layout": "vertical",
    "linkScale": 100,
    "linkWidth": 200,
    "background": {
	  "video": "wallpapers/video.mp4",
      "image": "wallpapers/image.jpg",
      "dim": 0.4,
      "blur": 4
    }
  },

  "search": {
    "enabled": true,
    "default": "Google",
    "providers": {
      "Google": "https://www.google.com/search?q=",
      "Brave":  "https://search.brave.com/search?q="
    }
  }
}
```

## Things I know you'll ask:

- **No bookmarks.json?** You get a button asking you to load one. Click it or drag the file on the page. Both work.
- **I changed the JSON but nothing happened.** The file gets cached in your browser after the first load. Load it again with the button. (shortcut: ```shift + ctrl + r```)
- **Why can't I write comments in the JSON?** Because JSON doesn't allow comments. It's a 20-year-old spec that nobody bothered to fix. Suffer.
- **Trailing commas.** Don't. JSON hates them. Your editor will probably yell at you, listen to it.
- **Background image shows but the video doesn't.** Check the path first — remember, relative to `index.html`, no leading slash. Then check DevTools → Network for a 404 or a codec error. If your video is `.mov`, Firefox won't play it. Convert to `.mp4` or `.webm`.
- **`linkWidth` doesn't seem to work in vertical or stacked layout.** Yeah, that was a real bug. Fixed in the CSS. If it's still not working, hard refresh (`ctrl + shift + r`) — Firefox caches CSS hard.
- **Is this doc.md AI generated?.** Yup, it is for the most part, i will not bother losing my time fixing what others couldnt do better and i need a better homepage, so yeah.