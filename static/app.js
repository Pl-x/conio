const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();
const port = 3000;

const corsOptions = {
    origin: 'http://localhost:8000/send-email/',  // Django's URL
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
  };

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors(corsOptions));

// Serve the contact form (HTML)
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/me.html'); // Make sure the contact form HTML is in the same directory
// });

// Send email when form is submitted
app.post('send-email/', (req, res) => {
  const { name, email, message } = req.body;

  // Create a transporter object using your email service
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Change to your email provider or use SMTP
    auth: {
      user: 'minjaehwang06@gmail.com', // Replace with your email
      pass: 'fkge lsrr yyai ikdl'  // Replace with your email password or app-specific password
    }
  });

  // Setup email data
  const mailOptions = {
    from: email,
    to: 'minjaehwang06@gmail.com',  // Replace with your email address
    subject: `New message from ${name}`,
    text: `You have received a new message from ${name} (${email}):\n\n${message}`
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: 'Failed to send email.' });
    }
    console.log('Email sent: ' + info.response);
    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
