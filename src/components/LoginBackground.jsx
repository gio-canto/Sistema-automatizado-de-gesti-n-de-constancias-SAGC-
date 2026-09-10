import { useEffect, useState } from 'react';
import { LOGIN_IMAGES } from '../assets/branding.js';

export default function LoginBackground() {
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    LOGIN_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const interval = window.setInterval(() => {
      setImageIndex((current) => (current + 1) % LOGIN_IMAGES.length);
    }, 10000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="back-image" aria-hidden="true">
      <div className="container-image">
        {LOGIN_IMAGES.map((src, index) => (
          <div
            key={src}
            className={`login-slide ${index === imageIndex ? 'login-slide--active' : ''}`}
            style={{ '--login-image': `url("${src}")` }}
          >
            <img className="imagen-mamalona" src={src} alt="" />
          </div>
        ))}
      </div>
    </div>
  );
}
