const socket = io();

const messageform = document.querySelector('#message-form');
const messageforminput = document.querySelector('#message-form input');
const btn = document.querySelector('form button');
const sendlocation = document.querySelector('#send-location');  // send location button
const messages = document.querySelector('#messages');   // to show in GUI

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;

socket.on('message', (message) => {
    console.log(message);

    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format("HH:MM dddd")
    });
    messages.insertAdjacentHTML('beforeend', html);
})

socket.on('locationMessage', (location) => {
    console.log(location);

    const html = Mustache.render(locationMessageTemplate, {
        url: location.url,
        createdAt: moment(location.createdAt).format("HH:MM dddd")
    });
    messages.insertAdjacentHTML('beforeend', html);
})

messageform.addEventListener('submit', (e) => {
    e.preventDefault();

    btn.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;    // called by name="message"

    socket.emit('sendMessage', message, (error) => {
        // console.log('Message was delivered');

        btn.removeAttribute('disabled');
        messageforminput.value = '';
        messageforminput.focus();

        if (error) {
            return console.log(error);
        }

        console.log('Message sent!');
    });
})

sendlocation.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    sendlocation.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition(position => {
        // console.log(position);

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }, () => {
            sendlocation.removeAttribute('disabled');
            console.log('Location shared');
        })
    })
})