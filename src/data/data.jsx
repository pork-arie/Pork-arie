import FrontEnd from '../assets/certproj/FrontEnd.png'
import google from '../assets/certproj/google-cert.png'
import hugpot from '../assets/certproj/hugpot.png'
import bas from '../assets/certproj/makebascert.png'
import adv from '../assets/certproj/makeadcert.png'

import gym1 from '../assets/certproj/gym1.png'
import gym4 from '../assets/certproj/gym4.png'
import gym2 from '../assets/certproj/gym2.png'
import gym3 from '../assets/certproj/gym3.png'
import nwssu from '../assets/certproj/eval.png'
import nwssu1 from '../assets/certproj/eval1.png'
import nwssu2 from '../assets/certproj/eval2.png'
import nwssu3 from '../assets/certproj/eval3.png'
import church from '../assets/certproj/church-ap.png'
import c1 from '../assets/certproj/c1.png'
import c2 from '../assets/certproj/c2.png'
import c3 from '../assets/certproj/c3.png'


export const project = [
    {
        id: 1,
        name: "GymTrack",
        description: "A full-stack management system utilizing React, Node.js, Prisma, and PostgreSQL, designed to streamline gym operations by providing real-time data visualization for members, staff, and workout sessions.",
        img: gym1, 
        img1: gym4, 
        img2: gym2, 
        img3: gym3, 

         stack: ["React", "Vite", "CSS", "Node.js", "Express.js", "Prisma", "PostgreSQL"]
    },
    {
        id: 2,
        name: "Faculty Evaluation System",
        description: "A dynamic web application demonstrating strong front-end logic and cloud integration. Leveraging Firebase as a Backend-as-a-Service, it handles user authentication, real-time database syncing, and responsive UI design, resulting in a seamless evaluation experience.",
        img: nwssu,
        img1:nwssu1,
        img2:nwssu2,
        img3:nwssu3,
        stack: ["HTML", "CSS", "JavaScript", "Firebase", "Firestore"]
    },
    {
        id: 3,
        name: "Appoint",
        description: "A dynamic MERN-style application demonstrating end-to-end development. The frontend is built with React and Vite, while Node.js and Express.js power the backend API. Data is persisted in MongoDB Atlas via Mongoose ODM, with secure JWT/session-based authentication and automated email handling via Nodemailer.",
        img: church, 
        img1: c1, 
        img2: c2, 
        img3: c3, 
        
         stack: ["React", "Vite", "Node.js", "Express.js", "MongoDB", "Mongoose", "JWT", "Nodemailer"]
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