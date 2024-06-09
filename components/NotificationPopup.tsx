import React, { useState, useEffect } from 'react';

const NotificationPopup = ({ message, onClick }: any) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded shadow-lg cursor-pointer" onClick={onClick}>
      {message}
    </div>
  );
};

export default NotificationPopup;
