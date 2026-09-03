require('dotenv').config()

const express = require('express')
const nodemailer = require('nodemailer')
const cors =require('cors')
const path = require('path')


const app = express();

app.use(cors())
app.use(express.json())

const transporter = nodemailer.createTransport({

    service:'GMAIL',
    auth:{
        user:process.env.GMAIL_USER,
        pass:process.env.GMAIL_PASS,
    }

});

app.post('/api/contact', async (req,res) => {
    const {name,email,message} = req.body;
    const mailOptions = {
        from: `"My Portfolio website" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_RECIPIENT,
        subject: `New message from ${name}`,
        html:`<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Message:</b> ${message}</p>`
    };

    try {
        await transporter.sendMail(mailOptions)
        res.status(200).json({success:true,message:"message sent"})
    } catch (error) {
        console.log("error",error)
        res.status(500).json({success: false, message: "Failed to send." })
        
    }
});

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*',(req,res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    })
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server running ${PORT}`))