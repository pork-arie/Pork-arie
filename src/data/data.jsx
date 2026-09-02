import FrontEnd from '../assets/certproj/FrontEnd.png'
import google from '../assets/certproj/google-cert.png'
import hugpot from '../assets/certproj/hugpot.png'
import bas from '../assets/certproj/makebascert.png'
import adv from '../assets/certproj/makeadcert.png'

import gym from '../assets/certproj/gym.png'
import nwssu from '../assets/certproj/eval.png'
import church from '../assets/certproj/church-ap.png'

export const project = [
    {
        id: 1,
        name: "GymTrack",
        description: "A full-stack management system utilizing React, Node.js, Prisma, and PostgreSQL, designed to streamline gym operations by providing real-time data visualization for members, staff, and workout sessions.",
        img: gym, 
    },
    {
        id: 2,
        name: "Faculty Evaluation System",
        description: "A dynamic web application demonstrating strong front-end logic and cloud integration. Leveraging Firebase as a Backend-as-a-Service, it handles user authentication, real-time database syncing, and responsive UI design, resulting in a seamless evaluation experience.",
        img: nwssu, 
    },
    {
        id: 3,
        name: "Appoint",
        description: "A dynamic MERN-style application demonstrating end-to-end development. The frontend is built with React and Vite, while Node.js and Express.js power the backend API. Data is persisted in MongoDB Atlas via Mongoose ODM, with secure JWT/session-based authentication and automated email handling via Nodemailer.",
        img: church, 
    }

]

export const certificates = [
    {
    id: 1,
    name: "FrontEnd Dev(react)",
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
    name: "Hugpot Digital Marketing",
    description: "Hugpot Certification",
    img: hugpot, 
    },
    {
    id: 4,
    name: "Make Advance",
    description: "Make automation Certification",
    img: adv, 
    },
    {
    id: 5,
    name: "Make Basics",
    description: "Make automation Certification",
    img: bas, 
    },
]