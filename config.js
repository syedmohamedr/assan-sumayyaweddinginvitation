/**
 * ===================================================================
 * WEDDING INVITATION CONFIGURATION
 * ===================================================================
 * Easily customize any wedding details below!
 * All changes will automatically update across the entire site.
 */
const WEDDING_CONFIG = {
  // Couple Information
  groom: {
    name: "ASSAN A",
    shortName: "Assan",
    title: "Groom"
  },
  bride: {
    name: "SUMAYYA J",
    shortName: "Sumayya",
    title: "Bride"
  },

  // Wedding Date & Time
  // Target format: YYYY-MM-DDTHH:MM:SS+05:30 (India Standard Time)
  weddingDateISO: "2026-12-20T11:00:00+05:30",
  dateFormatted: "20 DECEMBER 2026",
  dateNumeric: "20 • 12 • 2026",
  dayOfWeek: "Sunday",
  timeFormatted: "11:00 AM TO 3:00 PM",

  // Venue & Location
  venue: {
    name: "Pankaja Auditorium",
    city: "Mudappaloor",
    district: "Palakkad, Kerala",
    fullAddress: "Pankaja Auditorium, Mudappaloor, Palakkad District, Kerala",
    mapLink: "https://maps.app.goo.gl/8tPDfiJvE3bpFy9u6?g_st=aw"
  },

  // Emotional & Spiritual Messages
  texts: {
    bismillahEnglish: "BISMILLAHI RAHMANI RAHIM",
    bismillahArabic: "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    saveTheDate: "SAVE THE DATE",
    openingGratitude: "With hearts full of gratitude and happiness, we invite you to celebrate the beginning of a beautiful journey together.",
    togetherFamilies: "TOGETHER WITH OUR FAMILIES",
    requestHonour: "request the honour of your presence at their wedding celebration",
    countdownHeading: "COUNTING DOWN TO FOREVER",
    scratchPrompt: "TOUCH & SCRATCH TO REVEAL DATE",
    scratchSuccess: "WE CANNOT WAIT TO CELEBRATE WITH YOU!",
    holyQuote: "“And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them; and He has put love and mercy between your hearts.”",
    holyQuoteSource: "— Holy Quran (Surah Ar-Rum 30:21)",
    willYouJoin: "WILL YOU JOIN US?",
    willYouJoinSub: "Your presence would make our special day even more meaningful and blessed.",
    closingPoemLine1: "Two hearts,",
    closingPoemLine2: "One beautiful journey,",
    closingPoemLine3: "A lifetime of memories waiting to begin.",
    closingGratitude: "Thank you for being part of our special day!"
  },

  // WhatsApp & Calendar Action Links
  contact: {
    whatsappNumber: "919876543210", // Set your WhatsApp number here (with country code, no +)
    rsvpMessage: "Assalamu Alaikum! Delighted to confirm our attendance for the wedding of Assan A & Sumayya J on 20th December 2026 at Pankaja Auditorium.",
    shareMessage: "✨ You are cordially invited to celebrate the wedding of Assan A & Sumayya J on 20th December 2026 at Pankaja Auditorium, Mudappaloor. Tap link to open the invitation:"
  },

  // Audio / Background Music
  audio: {
    // Wedding Nasheed by Muhammad Al Muqit (https://youtu.be/ivrumxRUz_Y)
    customAudioSrc: "assets/audio/wedding_nasheed.mp3",
    youtubeUrl: "https://youtu.be/ivrumxRUz_Y",
    title: "Wedding Nasheed - Muhammad Al Muqit",
    soundEnabledDefault: true
  }
};
