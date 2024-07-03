const express = require('express')
const axios = require('axios')
const geoip = require('geoip-lite')
const cron = require('node-cron');
require('dotenv').config()

const app = express()
const port = 3000

const API_KEY = process.env.API_KEY

app.use(express.json());



app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    //location from Ip
    let geo = geoip.lookup(clientIp)
    let city
    if(!geo) {
        console.log(`Could not determine location from IP: ${clientIp}`)
        city= 'New York'   //default
    } else{
        city = geo.city
    }

    const url =  `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    console.log(url);

    try {
        const response = await axios.get(url);
        const data = response.data;
        const temperature = data.main.temp;
        const greeting = `Hello, ${visitorName}! The temperature is ${temperature}degrees Celsius in ${city}.`;

        res.json({
            client_ip: clientIp,
            location: city,
            greeting: greeting
        });

    } catch (error) {
        console.error(error)
        res.status(500).send('Error Occurred')
    }
}) 

app.get('/ping', (req, res) => {
    res.send('Server is alive');
});

cron.schedule('*/3 * * * *', async () => {
    try {
        await axios.get('https://hng1-1.onrender.com/api/hello');
        console.log('Server pinged');
    } catch (error) {
        console.error('Error pinging the server:', error);
    }
});



app.listen(port, () => {
    console.log(`Server listening on port ${port}!`)
})