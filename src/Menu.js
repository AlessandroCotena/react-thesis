/*
Interfaccia dove utente può scegliere se aprire server oppure connettersi come client

Contiene: due tasti "Connect" e "Host"

Se utente clicca "Connect", si presenta un nuovo componente con un tasto di conferma per stabilire il collegamento e due text box dove viene chiesto di inserire:
  - Porta server (senza scelta di IP; Il client effettua il collegamento solo a localhost)
  - Targa auto (inizialmente generata a caso)
Una volta clicca il tasto di conferma, l'interfaccia cambia a Client.js

Se utente clicca "Host", si presenta un nuovo componente con un tasto di conferma per creare il server e due text box dove viene chiesto di inserire:
  - Porta server
  - Numero di posti del parcheggio.
Una volta cliccato il tasto di conferma, l'interfaccia cambia a Host.js
*/

import './index.css';
import { Button, Container } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const optionsEnum = Object.freeze({
  CLIENT: 1,
  SERVER: 2
})

function plateGen(length) { // Funzione per generare targa random.
  var result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/*
Componente superiore del menù con tasti per connettersi o creare un server.
Questa componente ha funzioni di callback per dire alla componente padre quali opzioni far apparire quando un utente preme uno dei due tasti.
*/
function Selection(props) {
  function clientOptions(e) {
    props.clientFun();
    e.preventDefault(); // Previene il refresh della pagina.
  }
  function serverOptions(e) {
    props.serverFun();
    e.preventDefault();
  }

  return (
    <div>
      <form onSubmit={clientOptions}>
        <Button type="submit" className='my-3'>Connect</Button>
      </form>

      <form onSubmit={serverOptions}>
        <Button type="submit" className='mb-2'>Host</Button>
      </form>
    </div>
  );
}

function Options(props) { // Componente inferiore del menù con diversi parametri di input a seconda del tasto premuto.
  const [port, setPort] = useState(3002);
  const [plate, setPlate] = useState(plateGen(6));
  const [spots, setSpots] = useState(3);
  const navigate = useNavigate();

  function createServer(e) {
    axios.post('http://localhost:3001/start', { // Comunica ad HTTP server di aprire websocket con porta desiderata.
      port: port,
      spots: spots
    })
      .then((response) => {
        if (response.status === 200) {
          navigate(`/host/${port}`);
        }
      }, (error) => {
        console.log(error);
      });
    e.preventDefault();
  }

  const portInput = (
    <div>
      <span className='text-white'>Port number</span><br></br>
      <input type="text"
        placeholder="Insert port number"
        onChange={(e) => setPort(e.target.value)}
        value={port} />
    </div>
  );

  switch (props.opt) {
    case optionsEnum.CLIENT:
      return (
        <form onSubmit={(e) => navigate(`/client/${port}?plate=${plate}`)}>
          {portInput}
          <span>License plate</span>
          <br />
          <input type="text"
            placeholder="Insert license plate"
            onChange={(e) => setPlate(e.target.value)}
            value={plate} />
          <br />
          <Button className='my-3' type="submit">Estabilish connection</Button>
        </form>
      );

    case optionsEnum.SERVER:
      return (
        <form onSubmit={createServer}>
          {portInput}
          <span>Parking spots</span>
          <br />
          <input type="text"
            placeholder="Insert number of parking spots"
            onChange={(e) => setSpots(e.target.value)}
            value={spots} />
          <br />
          <Button className='my-3' type="submit">Create server</Button>
        </form>
      );

    default:
      return (null);
  }
}

function Menu() { // Componente che comprende entrambi le due componenti precedenti.
  const [opt, setOpt] = useState(0);

  function setClientOptions() {
    setOpt(optionsEnum.CLIENT);
  }

  function setServerOptions() {
    setOpt(optionsEnum.SERVER);
  }
  return (
    <Container className='text-center'>
      <Selection clientFun={setClientOptions} serverFun={setServerOptions} />
      <Options opt={opt} />
    </Container>
  );
}

export default Menu;