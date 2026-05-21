"use client";

import { useState, useEffect } from "react";
import styles from "./robust-iframe-player.module.css";

interface Props {
  url: string;
  title: string;
  className?: string;
}

export function RobustIframePlayer({ url, title, className = styles.iframe }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={styles.placeholder} />;

  return (
    <iframe
      key={url}
      src={url}
      title={title}
      className={className}
      frameBorder="0"
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
      loading="lazy"
    />
  );
}
