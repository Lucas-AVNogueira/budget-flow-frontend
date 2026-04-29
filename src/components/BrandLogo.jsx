import { useMemo, useState, useEffect } from 'react';

const variantSources = {
  main: ['/logo-main.png', '/logo.png'],
  dark: ['/logo-dark.png', '/logo-main.png', '/logo.png'],
  mono: ['/logo-mono.png', '/logo-main.png', '/logo.png'],
  iconFlat: ['/icon-flat.png', '/logo-main.png', '/logo.png'],
  iconApp: ['/icon-app.png', '/icon-flat.png', '/logo-main.png', '/logo.png'],
};

export default function BrandLogo({
  variant = 'main',
  alt = 'Budget-Flow',
  className,
  style,
}) {
  const sources = useMemo(
    () => variantSources[variant] || variantSources.main,
    [variant]
  );
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [variant]);

  function handleError() {
    setSourceIndex((prev) => (prev < sources.length - 1 ? prev + 1 : prev));
  }

  return (
    <img
      src={sources[sourceIndex]}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      loading="lazy"
    />
  );
}
