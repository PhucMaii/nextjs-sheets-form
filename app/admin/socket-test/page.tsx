"use client";

import { socket } from '@/app/socket';
import React, { useEffect, useState } from 'react'

export default function SocketTest() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [transport, setTransport] = useState<string>("N/A");

  const [buttonComp, setButtonComp] = useState<any>("Send Event");
  
  console.log(socket);
  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);
    // socket.on("disconnect", onDisconnect);
    socket.on("responseEvent", (data) => {
      console.log({client: data})
      setButtonComp(`Receive from Server: ${data}`);
    })

    return () => {
      socket.disconnect
      // socket.off("disconnect", onDisconnect);
    }
  }, [])

  const onConnect = () => {
    setIsConnected(true);
    setTransport(socket.io.engine.transport.name);

    socket.io.engine.on("upgrade", (transport) => {
      setTransport(transport.name);
    });
  }

  const sendSocketEvent = () => {
    socket.emit("myEvent", "Hello, Server");
  }

  return (
<div>
      <button onClick={sendSocketEvent}>
        {buttonComp}
      </button>
    </div>
  )
}
