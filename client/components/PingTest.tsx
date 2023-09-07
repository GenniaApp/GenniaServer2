import React, { useState, useEffect } from 'react';

const PingTest = () => {
  const [ping, setPing] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const startTime = Date.now();
      fetch(`${process.env.NEXT_PUBLIC_SERVER_API}/ping`)
        .then(() => {
          const endTime = Date.now();
          setPing(endTime - startTime);
        })
        .catch(() => {
          setPing(null);
        });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className='menu-container'
      style={{
        zIndex: '110',
        display: 'flex',
        alignItems: 'center',
        marginRight: '0.5rem',
      }}
    >
      {ping !== null ? `Ping: ${ping}ms` : 'null'}
    </div>
  );
};

export default PingTest;
