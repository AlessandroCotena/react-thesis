const WebSocket = require('ws');
const express = require('express'); // HTTP server necessario per poter creare websocket con porta dinamica.
const url = require('url'); // Per abilitare cross-origin.
const cors = require('cors');

const HTTP_SERVER_PORT = 3001;
const clients = new Map();

var listener;
var maxParkingSpots;
var webSocketServer = null;

const app = express();
app.use(cors());
app.use(express.json());

app.post('/start', (req, res) => { // HTTP server riceve richiesta POST quando utente vuole aprire un server.
    const port = req.body.port; // Porta del websocket.
    const spots = req.body.spots; // Numero massimo di posti occupabili.
    if (!port || !spots) {
        res.status(400).send("Bad request, missing port or spots parameter.");
        return;
    }

    webSocketServer = new WebSocket.Server({ port: port });
    maxParkingSpots = spots;
    setupWebsocketServer(res);
})

app.listen(HTTP_SERVER_PORT);

function setupWebsocketServer(res) {
    webSocketServer.on('connection', (webSocket, req) => {
        const parsedUrl = url.parse(req.url, true);
        const licensePlate = parsedUrl.query.plate; // Chiunque si connetta al websocket deve aver passato un paramentro targa.

        if (!licensePlate) {
            kickWithMessage(webSocket, "License plate is missing.");
        }
        else if (licensePlate == "listener") { // Chi crea il parcheggio invierà targa con valore "listener" in modo da ricevere la lista di macchine attualmente dentro il parcheggio.
            listener = webSocket;
            console.log("Listener è entrato nel parcheggio");

            webSocket.on('close', () => {
                console.log("Listener ha lasciato il parcheggio.");
                listener = null;
                webSocketServer.close();
            })
        }
        else {
            if (clients.size >= maxParkingSpots) {
                kickWithMessage(webSocket, "Parking area full.");
            }

            webSocket.send("Parking spot found!");
            clients.set(webSocket, [licensePlate, new Date().toLocaleString()]);
            console.log(`${licensePlate} è entrato nel parcheggio`);
            sendInfoToListener();

            webSocket.on('close', () => {
                console.log(`${clients.get(webSocket)[0]} ha lasciato il parcheggio.`);
                clients.delete(webSocket);
                sendInfoToListener();
            })
        }
    });
    res.status(200).send("Websocket created.");
}

function kickWithMessage(webSocket, message) {
    webSocket.send(message);
    webSocket.close();
}

function sendInfoToListener() {
    if (listener) {
        listener.send(JSON.stringify(Array.from(clients.values())));
    }
}