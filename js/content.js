/* ════════════════════════════════════════════════════════════════
   CONTENT.JS  ·  everything you will ever need to edit lives here
   ────────────────────────────────────────────────────────────────
   1. Music file
   2. Five letters
   3. Three memes + captions
   4. Final question + final message

   Edit the text between the quotes and save. That's it.
   (You can also just click the dashed areas on the site and type —
    it saves in the browser. Hold `R` for 1.5s to reset.)
   ════════════════════════════════════════════════════════════════ */

const SITE = {

  /* ── 1 · BACKGROUND MUSIC ─────────────────────────────────────
     Put your own audio file at:  assets/music.mp3
     Any format the browser supports (.mp3, .m4a, .ogg) works.  */
  music: {
    src: 'assets/music.mp3',
    volume: 0.45
  },

  /* ── 2 · OPENING SCREEN ─────────────────────────────────────── */
  opening: {
    eyebrow: 'Before you enter…',
    titleTo: 'My Only Love',
    name: 'Zozty',
    subtitle: 'Some things are easier to write than to say.',
    button: 'Enter',
    footnote: 'Sound on. It matters.'
  },

  /* ── 3 · THE FIVE LETTERS ────────────────────────────────────
     Write inside the quotes. Leave a letter blank if you'd rather
     fill it in on the site later.  */
  letters: [
    {
      label: 'LETTER I',
      date: '',
      message: '[1/9 will always be such a special date to me because it’s the day you were born. sometimes i think about how different my life would be if i had never met you, and honestly, i’m just so grateful that i did. i’m so happy that you exist and that somehow, out of everyone in the world, you became such an important person to me. i hope your birthday reminds you of how loved you are, not just today but every single day. you deserve so much happiness, and i genuinely hope i get to be there for so many of your birthdays in the future. 🤍]'
    },
    {
      label: 'LETTER II',
      date: '',
      message: '[ i don’t think you realize how much you changed in me without even trying. you made me look at myself differently and helped me become kinder to myself. there were things i didn’t like about myself before, and somehow loving you made me appreciate myself a little more. you made me feel like i could be completely myself without constantly worrying about how i’m being seen. i’ll always be grateful for that, because you didn’t just become someone i love, you became someone who made me love myself a little more too. ]'
    },
    {
      label: 'LETTER III',
      date: '',
      message: '[ there’s something about you that makes me feel safe in a way i can’t really put into words. i can have the worst day and somehow just being around you makes everything feel a little lighter. and your hugs have a whole different kind of comfort. i don’t know what it is about them, but whenever you hold me, i just feel like i can finally relax and forget about everything for a while. it’s such a simple thing, but it means so much to me. i hope you always know how comforting your presence is to me, even when you’re not doing anything at all. ]'
    },
    {
      label: 'LETTER IV',
      date: '',
      message: '[ i know we’ve only been together for 3 months, but i genuinely can’t believe how much i’ve grown to love you in such a short time. i didn’t expect to get this attached or to care about someone this deeply this quickly, but i wouldn’t change it. i love the little things about you, the way you talk, the way you make me laugh, the way you make me feel, and even the things you probably don’t think anyone notices. i just love you, all of you, and sometimes i wish i could put everything i feel into words so you could understand just how much you mean to me. ]'
    },
    {
      label: 'LETTER V',
      date: '',
      message: '[ one of the things i find myself praying for almost every day is that we get to have a future together. i don’t just want the big moments with you, i want all the boring little ones too. i want random late night conversations, laughing over stupid things, making memories out of normal days, and eventually having a place that feels like ours. i hope that if we’re meant to be, life keeps choosing us for each other. because when i imagine the future, you’re honestly the person i want beside me. i don’t want someone better, i want you. 🤍 ]'
    }
  ],

  /* ── 4 · THE THREE MEMES ────────────────────────────────────
     src:  ''  → empty frame.  Or  'assets/meme1.jpg'  to point
                  at an image already in the folder.
                  (You can also click the frame on the site.)
     caption: write it here, or click under the frame later.     */
  memes: [
    { label: 'MEME 01', src: 'assets/meme1.jpg', caption: '[ i cant live without you]'},
    { label: 'MEME 02', src: 'assets/meme2.jpg', caption: '[ i love you ]' },
    { label: 'MEME 03', src: 'assets/meme3.jpg', caption: '[ FOREVER ]' }
  ],

  memesSection: {
    title: 'Three moments',
    subtitle: ''          /* optional — leave blank to hide the line */
  },

  /* ── 5 · THE QUESTION & THE ENDING ─────────────────────────── */
  finale: {
    eyebrow: 'one last thing',
    question: 'Do you love me?',
    yes: 'Yes',
    no: 'No',
    hint: 'Take your time.',
    noLines: ['Are you sure?', 'Really?', 'Think again.', 'Nope \u{1F62D}', 'Nice try.', 'Wrong button.', 'Please?'],
    finalLabel: 'The end',
    closing: '',         /* optional — leave blank to hide the sign-off */
    message: '[ I love you so so much it’s actually crazy 😭❤️ like I genuinely don’t think you understand how much I love you. I always wanna talk to you and be with you and literally just annoy you all day 😭 I miss you even when we just talked like 5 minutes ago. You’re always on my mind and I swear I just keep getting more attached to you every day. I love having you in my life so much and I never want you to forget how much you mean to me. I love youuu so much baby 😭❤️ ]'
  }
};
