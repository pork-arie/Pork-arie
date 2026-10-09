import FrontEnd from '../assets/certproj/FrontEnd.webp'
import google from '../assets/certproj/google-cert.webp'
import hubspot from '../assets/certproj/hubspot.webp'
import bas from '../assets/certproj/makebascert.webp'
import adv from '../assets/certproj/makeadcert.webp'

import gym1 from '../assets/certproj/gym1.webp'
import gym4 from '../assets/certproj/gym4.webp'
import gym2 from '../assets/certproj/gym2.webp'
import gym3 from '../assets/certproj/gym3.webp'
import nwssu from '../assets/certproj/eval.webp'
import nwssu1 from '../assets/certproj/eval1.webp'
import nwssu2 from '../assets/certproj/eval2.webp'
import nwssu3 from '../assets/certproj/eval3.webp'
import church from '../assets/certproj/church-ap.webp'
import c1 from '../assets/certproj/c1.webp'
import c2 from '../assets/certproj/c2.webp'
import c3 from '../assets/certproj/c3.webp'
import freecode from '../assets/freecode.webp'

// Your links, used in the About icons, footer and contact section.
// Leave a value as "" to hide that link.
export const socials = {
    email: "bangcaleanghel@gmail.com",
    github: "https://github.com/pork-arie",
    linkedin: "https://www.linkedin.com/in/ariel-angel-bangcale-38461434b",
    facebook: "https://www.facebook.com/anghel.bangcale/",
    instagram: "https://www.instagram.com/pork_ari3/",
}

/*
  Projects
  - live / github: paste the URLs; empty "" hides the button on the detail page
  - role, problem, built: the case-study part of the detail page. These are
    drafts, rewrite them in your own words and add a real result if you have one
*/
export const project = [
    {
        id: 1,
        name: "GymTrack",
        description: "A full-stack management system utilizing React, Node.js, Prisma, and PostgreSQL, designed to streamline gym operations by providing real-time data visualization for members, staff, and workout sessions.",
        img: gym1,
        img1: gym4,
        img2: gym2,
        img3: gym3,
        live: "",
        github: "",
        role: "Solo project: design, front end, back end and database",
        problem: "Gyms that track check-ins and memberships on paper can't easily see who is on the floor, whose plan is about to lapse, or how much came in today.",
        built: [
            "Front-desk check-in and check-out by member code",
            "Live dashboard: members on the floor, active memberships, collections and lapsing plans",
            "Member list with membership status at a glance",
            "Plans and pricing (walk-in, weekly, monthly, student, annual) the owner can edit",
        ],
        stack: ["React", "Vite", "CSS", "Node.js", "Express.js", "Prisma", "PostgreSQL"]
    },
    {
        id: 2,
        name: "Faculty Evaluation System",
        description: "A web and mobile system for NwSSU where students evaluate their teachers on an Android app and administrators manage everything from a web dashboard, built on Firebase for authentication and real-time data.",
        img: nwssu,
        img1: nwssu1,
        img2: nwssu2,
        img3: nwssu3,
        live: "",
        github: "",
        role: "Capstone project, team of 5",
        problem: "Faculty evaluation was done on paper, which made collecting, computing and reporting ratings under CHED CMO No. 19 slow and error-prone.",
        built: [
            "Android app for students to evaluate each teacher per subject",
            "Web admin dashboard for departments, subjects, students and faculty, with CSV bulk upload",
            "Student and supervisor ratings computed per CMO 19, with printable Annex C and D reports",
            "Versioned question sets and secure Firebase sign-in with a forced password change on first login",
        ],
        stack: ["Kotlin", "Jetpack Compose", "HTML", "CSS", "JavaScript", "Firebase", "Firestore"]
    },
    {
        id: 3,
        name: "Appoint",
        description: "A dynamic MERN-style application demonstrating end-to-end development. The frontend is built with React and Vite, while Node.js and Express.js power the backend API. Data is persisted in MongoDB Atlas via Mongoose ODM, with secure JWT/session-based authentication and automated email handling via Nodemailer.",
        img: church,
        img1: c1,
        img2: c2,
        img3: c3,
        live: "",
        github: "",
        role: "Solo project for a church office",
        problem: "Parishioners had to call or visit the church office just to request a certificate or ask for a schedule.",
        built: [
            "Guest booking with no account needed, in four short steps",
            "Certificate requests and sacrament scheduling (baptism, wedding) in one place",
            "Available dates and time slots shown before booking",
            "Email notification to the office for every new appointment, plus a reference code for follow-ups",
        ],
        stack: ["React", "Vite", "Node.js", "Express.js", "MongoDB", "Mongoose", "JWT", "Nodemailer"]
    }
]

export const certificates = [
    {
        id: 1,
        name: "Front-End Developer (React)",
        description: "HackerRank Certification",
        img: FrontEnd,
    },
    {
        id: 2,
        name: "Google Analytics",
        description: "Google Analytics Certification",
        img: google,
    },
    {
        id: 3,
        name: "HubSpot Digital Marketing",
        description: "HubSpot Academy Certification",
        img: hubspot,
    },
    {
        id: 4,
        name: "Make Advanced",
        description: "Make automation Certification",
        img: adv,
    },
    {
        id: 5,
        name: "FrontEnd Development",
        description: "FreeCode Camp Certification",
        img: freecode,
    },
    {
        id: 6,
        name: "Make Basics",
        description: "Make automation Certification",
        img: bas,
    },
]

/*
  Testimonials: the section stays hidden until you add at least one.
  Only use real quotes, with the client's permission. Example:
  { quote: "Ariel built our booking site in three weeks...", name: "Juan Dela Cruz", business: "Dela Cruz Dental Clinic" },
*/
export const testimonials = [
      {
    quote: "Our new booking site has made scheduling so much easier for our church office. What used to take several phone calls and emails can now be requested and confirmed online in just a few minutes. It’s saved our staff time and helped everything run more smoothly.",
    name: "Michael R.",
    business: "Email appoint",
  },
  {
    quote: "The check-in system has completely upgraded our front desk. Members can check in on their own in seconds, which keeps lines moving and gives our team more time to help people. It’s faster, simpler, and far easier to manage every day.",
    name: "Sarah T.",
    business: "Fitness Gym",
  }
]