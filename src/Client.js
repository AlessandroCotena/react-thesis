/*
Interfaccia che comunica al client se è dentro al parcheggio o meno.

Contiene: testo che inizialmente comunica al client che sta effettuando un tentativo di connessione al server.
Il messaggio può cambiare e confermare che la connessione è stata stabilita con successo oppure dare i seguenti errori:
- Connessione non stabilita perché il server non è aperto sulla porta scelta
- Connessione non stabilita perché il server ha il parcheggio pieno

In più, l'interfaccia deve contenere un tasto per ritornare indietro al menù.
*/
import { Link, useParams, useSearchParams } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Container } from 'reactstrap';

function Client() {
  const [searchParams] = useSearchParams();
  let { port } = useParams();
  const [socketUrl, setSocketUrl] = useState('');
  const [message, setMessage] = useState('Attempting to enter parking area.');

  const {
    lastMessage,
    readyState,
  } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      setMessage(lastMessage.data);
    }
  }, [lastMessage]);

  useEffect(() => {
    if (readyState === ReadyState.CLOSED & lastMessage == null) {
      setMessage("Parking area is closed.");
    }
  }, [readyState, lastMessage]);

  useEffect(() => {
    setSocketUrl(`ws://localhost:${port}/?plate=${searchParams.get("plate")}`);
  }, [port, searchParams]);

  return (
    <Container className="text-center">
      <span>{message}</span>
      <br />
      <Link to="/">Return to menu</Link>
    </Container>
  );
}

export default Client;