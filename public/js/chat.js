const socket = io();

// Elements
const messageform = document.querySelector('#message-form');
const messageforminput = document.querySelector('#message-form input');
const btn = document.querySelector('form button');
const sendlocation = document.querySelector('#send-location');  // send location button
const messages = document.querySelector('#messages');   // to show in GUI

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // New message element
    const newMessage = messages.lastElementChild;

    if (!newMessage) {
        return;     // exit there is no new message
    }

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    // console.log(newMessageStyles);
    // console.log(newMessageMargin);

    // Always scroll to the bottom
    messages.scrollTop = messages.scrollHeight;
}

// message
socket.on('message', (message) => {
    console.log(message);

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

// location
socket.on('locationMessage', (location) => {
    console.log(location);

    const html = Mustache.render(locationMessageTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
    })
    document.querySelector('#sidebar').innerHTML = html;
})

// user input messages
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

// user send current location
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

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/'
    }
});