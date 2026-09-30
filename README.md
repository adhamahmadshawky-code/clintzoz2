# For Zozty

A dark romantic digital love letter. Five letters, three moments, one question.

Everything you need to write is in **one file**: `js/content.js`.

---

## Run it

Double-click `index.html`. That's it.

Because browsers block sound until you interact, the site opens with a
**Before you enter… → ENTER** screen. That button is also what starts the music.

To publish it, upload the whole folder to GitHub Pages, Netlify drop, Vercel,
or any static host.

---

## Fill it in

Open `js/content.js` and replace what's between the quotes.

### 1 · Music
Put your file at `assets/music.mp3` — that's the path the site requests.

```js
music: { src: 'assets/music.mp3', volume: 0.45 }
```

### 2 · The five letters
```js
letters: [
  { label: 'LETTER I',   date: '', message: 'Anything you want. HTML works too — <b>bold</b>, <i>italic</i>.' },
  { label: 'LETTER II',  date: '', message: '...' },
  { label: 'LETTER III', date: '', message: '...' },
  { label: 'LETTER IV',  date: '', message: '...' },
  { label: 'LETTER V',   date: '', message: '...' }
]
```
`date` is optional — leave it `''` and it won't appear.

### 3 · The three memes
```js
memes: [
  { label: 'MEME 01', src: 'assets/meme1.jpg', caption: 'i love you' },
  { label: 'MEME 02', src: 'assets/meme2.jpg', caption: 'your caption' },
  { label: 'MEME 03', src: 'assets/meme3.jpg', caption: 'your caption' }
]
```
`src: ''` leaves a clean empty frame. You can also just **click a frame on the
site** and upload from your device, or drop a file onto it.

### 4 · The ending
```js
finale: {
  ...
  message: 'Your final words go here.'
}
```

Save the file, refresh the site. Done.

---

## Or just type it on the site

Every dashed area is editable in the browser:

- **Letters** — click the writing area
- **Captions** — click under a meme
- **Final message** — after you press YES
- **Images** — click a meme frame

What you type is saved in that browser automatically. To wipe it and go back to
`content.js`, hold the **R** key for a second and a half.

---

## Controls

| | |
|---|---|
| `←` `→` | previous / next letter |
| swipe | move between letters (mobile) |
| `♪` | play / pause music |
| `Esc` | leave an editing area |
| hold `R` | erase everything saved in this browser |

The **NO** button is not a bug. It stays inside the screen on every device.

---

## Files

```
index.html
css/style.css      all styling
js/content.js      ← everything you edit
js/app.js          all behaviour
assets/music.mp3   ← your audio
```

Colours, glow, timing, particle density and transitions are CSS variables at the
top of `css/style.css` if you ever want to retune the mood.
