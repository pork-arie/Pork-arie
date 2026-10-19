import FrontEnd from "../assets/certproj/FrontEnd.webp";
import google from "../assets/certproj/google-cert.webp";
import hubspot from "../assets/certproj/hubspot.webp";
import bas from "../assets/certproj/makebascert.webp";
import adv from "../assets/certproj/makeadcert.webp";

import gym1 from "../assets/certproj/gymtrack-2.webp";
import gym4 from "../assets/certproj/gymtrack-1.webp";
import gym2 from "../assets/certproj/gymtrack-3.webp";
import gym3 from "../assets/certproj/gymtrack-4.webp";
import gym5 from "../assets/certproj/gymtrack-5.webp";

import nwssu from "../assets/certproj/faculty-eval-2.webp";
import nwssu1 from "../assets/certproj/faculty-eval-1.webp";
import nwssu2 from "../assets/certproj/faculty-eval-3.webp";
import nwssu3 from "../assets/certproj/faculty-eval-4.webp";
import nwssu4 from "../assets/certproj/faculty-eval-5.webp";

import church from "../assets/certproj/appoint-1.webp";
import c1 from "../assets/certproj/appoint-2.webp";
import c2 from "../assets/certproj/appoint-3.webp";
import c3 from "../assets/certproj/appoint-4.webp";
import c4 from "../assets/certproj/appoint-5.webp";
import freecode from "../assets/freecode.webp";

import ap1 from "../assets/certproj/ap1.webp";
import ap2 from "../assets/certproj/ap2.webp";
import ap3 from "../assets/certproj/ap3.webp";
import ap4 from "../assets/certproj/ap4.webp";
import ap5 from "../assets/certproj/ap5.webp";

import bantay1 from "../assets/certproj/bantay-cover.webp"; // cover: 3 phones
import bantay2 from "../assets/certproj/bantay-2.webp";     // Selling
import bantay3 from "../assets/certproj/bantay-3.webp";     // Utang
import bantay4 from "../assets/certproj/bantay-4.webp";     // Inventory
import bantay5 from "../assets/certproj/bantay-5.webp";     // Profit forecast

// Your links, used in the About icons, footer and contact section.
// Leave a value as "" to hide that link.
export const socials = {
  email: "bangcaleanghel@gmail.com",
  github: "https://github.com/pork-arie",
  linkedin: "https://www.linkedin.com/in/ariel-angel-bangcale-38461434b",
  facebook: "https://www.facebook.com/anghel.bangcale/",
  instagram: "https://www.instagram.com/pork_ari3/",
};

// Toolkit section: three columns of tools. Add or remove names freely.
export const toolkit = [
  {
    group: "Frontend",
    title: "Interfaces",
    tools: [
      "React",
      "Vite",
      "Tailwind CSS",
      "JavaScript",
      "HTML / CSS",
      "Framer Motion",
    ],
  },
  {
    group: "Backend",
    title: "Logic & APIs",
    tools: ["Node.js", "Express", "PHP", "JWT", "Nodemailer", "Kotlin"],
  },
  {
    group: "Data",
    title: "Storage",
    tools: [
      "PostgreSQL",
      "Prisma",
      "MongoDB",
      "Firebase",
      "Firestore",
      "Supabase",
    ],
  },
];

/*
  Projects
  - live / github: paste the URLs; empty "" hides the button on the detail page
  - kind, short: the small label and one-line summary on the home page Work cards
  - platform, builtFor: shown in the info strip at the top of the case-study page
  - theme: the project's own accent color on its case-study page
  - img, img1, img2 … img9: screenshots, in order (img is the cover)
  - captions: one name per screenshot, in the same order, shown in the Screens gallery
  - role, problem, built: the case-study part of the detail page. These are
    drafts, rewrite them in your own words and add a real result if you have one
*/
export const project = [
  {
    id: 1,
    name: "GymTrack",
    kind: "Gym management · Solo project",
    platform: "Web app",
    builtFor: "Gym owners & front-desk staff",
    theme: { color: "#2E4FC7", soft: "#E6ECFF", glow: "rgba(120,150,255,.28)" },
    captions: [
      "Check-in desk",
      "Owner dashboard",
      "Members",
      "Plans & pricing",
    ],
    short:
      "Front-desk check-ins, a live dashboard of who is on the floor, and plans the owner can edit.",
    description:
      "A full-stack management system utilizing React, Node.js, Prisma, and PostgreSQL, designed to streamline gym operations by providing real-time data visualization for members, staff, and workout sessions.",
    img: gym1,
    img1: gym4,
    img2: gym2,
    img3: gym3,
    img4: gym5,
    live: "",
    github: "",
    role: "Solo project: design, front end, back end and database",
    problem:
      "Gyms that track check-ins and memberships on paper can't easily see who is on the floor, whose plan is about to lapse, or how much came in today.",
    built: [
      "Front-desk check-in and check-out by member code",
      "Live dashboard: members on the floor, active memberships, collections and lapsing plans",
      "Member list with membership status at a glance",
      "Plans and pricing (walk-in, weekly, monthly, student, annual) the owner can edit",
    ],
    stack: [
      "React",
      "Vite",
      "CSS",
      "Node.js",
      "Express.js",
      "Prisma",
      "PostgreSQL",
    ],
  },
  {
    id: 2,
    name: "Faculty Evaluation System",
    kind: "NwSSU · Solo Dev",
    platform: "Android app + web dashboard",
    builtFor: "Students, faculty & admins",
    theme: { color: "#14794A", soft: "#E3F5EA", glow: "rgba(60,200,130,.22)" },
    captions: [
      "Overview",
      "Admin sign-in",
      "Student management",
      "Department view",
    ],
    short:
      "Students rate their teachers in an Android app; admins manage everything on the web.",
    description:
      "A web and mobile system for NwSSU where students evaluate their teachers on an Android app and administrators manage everything from a web dashboard, built on Firebase for authentication and real-time data.",
    img: nwssu,
    img1: nwssu1,
    img2: nwssu2,
    img3: nwssu3,
    img4: nwssu4,
    live: "",
    github: "",
    role: "Solo Dev",
    problem:
      "Faculty evaluation was done on paper, which made collecting, computing and reporting ratings under CHED CMO No. 19 slow and error-prone.",
    built: [
      "Android app for students to evaluate each teacher per subject",
      "Web admin dashboard for departments, subjects, students and faculty, with CSV bulk upload",
      "Student and supervisor ratings computed per CMO 19, with printable Annex C and D reports",
      "Versioned question sets and secure Firebase sign-in with a forced password change on first login",
    ],
    stack: [
      "Kotlin",
      "Jetpack Compose",
      "HTML",
      "CSS",
      "JavaScript",
      "Firebase",
      "Firestore",
    ],
  },
    {
    id: 3,
    name: "Bantay",
    kind: "Point of sale & inventory · Solo project",
    platform: "Android app (React Native · Expo)",
    builtFor: "Sari-sari store owners & their staff",
    theme: { color: "#16A34A", soft: "#DCFCE7", glow: "rgba(34,197,94,.28)" },
    captions: [
      "Selling (tingi or by pack)",
      "Utang (credit) list",
      "Inventory & low-stock alerts",
      "Sales & profit forecast",
    ],
    short:
      "A point of sale for sari-sari stores: sell by piece or pack, scan barcodes, track utang and stock, and see next month's profit, all offline.",
    description:
      "An offline-first mobile point of sale built with React Native, Expo and TypeScript. It handles sales by piece or by pack, barcode scanning, cash/GCash/utang payments, receipts, inventory, sales forecasting and staff accounts. Store data is encrypted on the phone with AES-256-GCM and never leaves it, so it works without internet.",
    img: bantay1,
    img1: bantay2,
    img2: bantay3,
    img3: bantay4,
    img4: bantay5,
    live: "",
    github: "https://github.com/pork-arie/Bantay-app",
    role: "Solo project: design, mobile app, data and security",
    problem:
      "Most sari-sari stores keep utang in a notebook and stock in their heads, so unpaid balances get forgotten, items run out without warning, and the owner can't tell how much they actually earn. Many also have no reliable internet.",
    built: [
      "Fast selling by piece (tingi) or by pack, with continuous barcode scanning straight into the cart",
      "Cash, GCash and utang payments, with change computed and numbered receipts to print or share",
      "Utang list per customer with credit limits and SMS reminders",
      "Inventory with low-stock alerts, days-of-stock-left and an automatic shopping list",
      "Sales history and a forecast of next week's and next month's sales and profit, plus a profit calculator",
      "Staff PINs with limited access, an activity log, and voids that need the owner's PIN",
      "Works fully offline: data encrypted on the device (AES-256-GCM), password-protected backup files",
      "English, Filipino and Waray, light/dark mode and 8 accent colors",
    ],
    stack: [
      "React Native",
      "Expo",
      "Expo Router",
      "TypeScript",
      "SQLite",
      "Expo Crypto (AES-256-GCM)",
      "Expo Camera",
      "Reanimated",
      "EAS Build",
    ],
  },
  {
    id: 4,
    name: "Appoint",
    kind: "Church office · Solo project",
    platform: "Web app",
    builtFor: "Parishioners & office staff",
    theme: { color: "#6B3FA0", soft: "#F1E9FB", glow: "rgba(170,120,240,.26)" },
    captions: [
      "Landing",
      "Choose a service",
      "Particulars",
      "Pick a date & time",
    ],
    short:
      "Book certificates and sacrament schedules online instead of calling the office.",
    description:
      "A dynamic MERN-style application demonstrating end-to-end development. The frontend is built with React and Vite, while Node.js and Express.js power the backend API. Data is persisted in MongoDB Atlas via Mongoose ODM, with secure JWT/session-based authentication and automated email handling via Nodemailer.",
    img: church,
    img1: c1,
    img2: c2,
    img3: c3,
    img4: c4,
    live: "",
    github: "",
    role: "Solo project for a church office",
    problem:
      "Parishioners had to call or visit the church office just to request a certificate or ask for a schedule.",
    built: [
      "Guest booking with no account needed, in four short steps",
      "Certificate requests and sacrament scheduling (baptism, wedding) in one place",
      "Available dates and time slots shown before booking",
      "Email notification to the office for every new appointment, plus a reference code for follow-ups",
    ],
    stack: [
      "React",
      "Vite",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Mongoose",
      "JWT",
      "Nodemailer",
    ],
  },
  {
    id: 5,
    name: "Ambitpolong",
    kind: "Church youth app · Solo project",
    platform: "Installable web app (PWA)",
    builtFor: "Church youth groups, their leaders and members",
    theme: { color: "#5B4BF5", soft: "#EEEBFF", glow: "rgba(124,110,255,.28)" },
    captions: [
      "Home & prayer wall",
      "Bible & reading plans",
      "Groups & QR check-in",
      "Streaks & sharing",
      "Notes & notifications",
    ],
    short:
      "A verse for today, a prayer wall, the whole Bible offline, sermon notes and QR check-in for youth night, in one installable app.",
    description:
      "A full-stack progressive web app built with React, Vite and Supabase (PostgreSQL with row-level security, Auth, Storage, Edge Functions and scheduled jobs). It works offline, installs to the home screen without an app store, and sends push notifications to keep youth groups connected all week.",
    img: ap1,
    img1: ap2,
    img2: ap3,
    img3: ap4,
    img4: ap5,
    live: "https://ambitpolong.vercel.app",
    github: "https://github.com/pork-arie/Youth-Notes",
    role: "Solo project: design, front end, database, push notifications and deployment",
    problem:
      "Youth groups juggle group chats, paper attendance sheets and separate Bible apps, so prayer requests get buried, nobody knows who stopped coming, and sermon notes get lost.",
    built: [
      "Verse for today, a feed for reflections and a prayer wall with “praying” reactions",
      "The whole Bible offline, plus personal and group reading plans with progress",
      "Groups with an activities calendar, offline QR check-in and an attendance dashboard",
      "Sermon notes saved on the phone first and synced when online",
      "Reading and attendance streaks, shareable as posts or Instagram/Facebook stories",
      "Push notifications: comments, invites, 1-hour reminders, streaks and a 7 AM verse",
      "Google login, private accounts, block and report, and consent under the Data Privacy Act",
    ],
    stack: [
      "React",
      "Vite",
      "CSS",
      "Supabase",
      "PostgreSQL",
      "Edge Functions (Deno)",
      "Web Push",
      "Dexie (IndexedDB)",
      "PWA / Workbox",
      "Vercel",
    ],
  },
];

export const certificates = [
  {
    id: 1,
    name: "Front-End Developer (React)",
    issuer: "HackerRank",
    description: "HackerRank Certification",
    img: FrontEnd,
  },
  {
    id: 2,
    name: "Google Analytics",
    issuer: "Google",
    description: "Google Analytics Certification",
    img: google,
  },
  {
    id: 3,
    name: "HubSpot Digital Marketing",
    issuer: "HubSpot Academy",
    description: "HubSpot Academy Certification",
    img: hubspot,
  },
  {
    id: 4,
    name: "Make Advanced",
    issuer: "Make",
    description: "Make automation Certification",
    img: adv,
  },
  {
    id: 5,
    name: "FrontEnd Development",
    issuer: "freeCodeCamp",
    description: "FreeCode Camp Certification",
    img: freecode,
  },
  {
    id: 6,
    name: "Make Basics",
    issuer: "Make",
    description: "Make automation Certification",
    img: bas,
  },
];

/*
  Testimonials: the section stays hidden until you add at least one.
  Only use real quotes, with the client's permission. Example:
  { quote: "Ariel built our booking site in three weeks...", name: "Juan Dela Cruz", business: "Dela Cruz Dental Clinic" },
*/
export const testimonials = [
  {
    quote:
      "Our new booking site has made scheduling so much easier for our church office. What used to take several phone calls and emails can now be requested and confirmed online in just a few minutes. It’s saved our staff time and helped everything run more smoothly.",
    name: "Michael R.",
    business: "Email appoint",
  },
  {
    quote:
      "The check-in system has completely upgraded our front desk. Members can check in on their own in seconds, which keeps lines moving and gives our team more time to help people. It’s faster, simpler, and far easier to manage every day.",
    name: "Sarah T.",
    business: "Fitness Gym",
  },
];
