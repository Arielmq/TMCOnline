import React, { useState } from 'react';
import axios from 'axios';

export const StartLocalTunnelButton = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const startLocalTunnel = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.post('http://localhost:3000/api/start-localtunnel', {});
      setMessage(response.data.message || 'LocalTunnel iniciado con éxito');
      if (response.data.url) {
        console.log('URL de LocalTunnel:', response.data.url);
        // Opcional: Redirigir al usuario a la URL
        // window.location.href = response.data.url;
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error al iniciar LocalTunnel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={startLocalTunnel} disabled={loading}>
        {loading ? 'Iniciando...' : 'Iniciar LocalTunnel'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

