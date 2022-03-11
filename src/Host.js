/*
Interfaccia dove vengono mostrate le macchine attualmente dentro al parcheggio

Contiene:
- Una lista (inizialmente vuota) che mostra ogni client dentro al parcheggio (con info quali la targa del client e la data+orario di arrivo del client)
- Un tasto per ritornare al menù.
*/

import { useParams, Link } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { Table, Container } from 'reactstrap';

function Host() {
  let { port } = useParams();
  const [socketUrl, setSocketUrl] = useState('');
  const [vehicles, setVehicles] = useState([]);

  const {
    lastMessage,
  } = useWebSocket(socketUrl);

  useEffect(() => { // Funzione chiamata quando creatore del parcheggio riceve messaggio da server con lista di macchine attualmente presenti nel parcheggio.
    if (lastMessage !== null) {
      const jsonMessage = JSON.parse(lastMessage.data);
      const vehiclesArray = Array.from(jsonMessage);
      setVehicles(vehiclesArray); // A vehicles viene assegnato un array, con ogni elemento contenente la targa della macchina (pos. [0]) e l'orario di entrata nel parcheggio (pos. [1]).
    }
  }, [lastMessage]);

  useEffect(() => { // Funzione che si connette al websocket come listener.
    setSocketUrl(`ws://localhost:${port}/?plate=listener`)
  }, [port]);

  return (
    <Container className="text-center">
      <Table
        bordered
        dark
      >
        <thead>
          <tr>
            <th>
              License Plate
            </th>
            <th>
              Time of Arrival
            </th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((val) =>
            <tr>
              <th>
                {val[0]}
              </th>
              <td>
                {val[1]}
              </td>
            </tr>)
          }
        </tbody>
      </Table>
      <Link to="/">Return to menu</Link>
    </Container>
  );
}

export default Host;