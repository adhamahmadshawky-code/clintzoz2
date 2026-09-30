# assets

Put your own files here. Nothing in this folder is required for the site to run —
it works with everything empty.

## Background music

```
assets/music.mp3
```

That exact path is what the site looks for. Drop your audio file there and
name it `music.mp3`.

Any format the browser can play works: `.mp3`, `.m4a`, `.ogg`, `.wav`.
If you'd rather use a different name or put it elsewhere, edit one line in
`js/content.js`:

```js
music: {
  src: 'assets/music.mp3',
  volume: 0.45
}
```

## Meme images

**Option A — point at a file (recommended, keeps the site tiny):**
Put the images in this folder and add their names in `js/content.js`:

```js
memes: [
  { label: 'MEME 01', src: 'assets/meme1.jpg', caption: '' },
  { label: 'MEME 02', src: 'assets/meme2.jpg', caption: '' },
  { label: 'MEME 03', src: 'assets/meme3.jpg', caption: '' }
]
```

**Option B — upload on the site:**
Click a `MEME 0X` frame and pick a file from your device. It is stored in that
browser only (cleared if you clear site data), which is perfect for a personal
gift. Right-click a frame while on the site → *Save image as* to keep a copy.

Keep meme images under ~4.5 MB each.
