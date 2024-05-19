var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cgangaro.atourret@gmail.com',
        pass: 'GrosPoireau2000!'
    }
});

var mailOptions = {
    from: 'cgangaro.atourret@gmail.com',
    to: 'gangarossa.camille@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
};

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
    } else {
    }
});