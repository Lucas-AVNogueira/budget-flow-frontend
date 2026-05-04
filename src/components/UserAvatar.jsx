import { useRef, useState, useEffect } from 'react';

function getStorageKey(username) {
  return `avatar_${username}`;
}

function resizeImage(dataUrl, maxSize = 200) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = dataUrl;
  });
}

export default function UserAvatar({ username }) {
  const inputRef = useRef(null);
  const [photo, setPhoto] = useState(() => localStorage.getItem(getStorageKey(username)));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPhoto(localStorage.getItem(getStorageKey(username)));
  }, [username]);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const resized = await resizeImage(ev.target.result, 200);
      localStorage.setItem(getStorageKey(username), resized);
      setPhoto(resized);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const defaultSrc = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(username)}&backgroundColor=6366f1,38bdf8&backgroundType=gradientLinear&fontSize=38`;

  return (
    <span className="user-avatar-wrapper" onClick={handleClick} title="Clique para alterar a foto" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
      <img
        className={`navbar-avatar${saved ? ' navbar-avatar--saved' : ''}`}
        src={photo || defaultSrc}
        alt={username}
        aria-hidden="true"
      />
      <span className="user-avatar-overlay" aria-hidden="true">
        {saved ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        )}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </span>
  );
}
