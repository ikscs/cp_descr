// src/components/VideoPlayer.tsx
import React, { useRef, useEffect } from 'react';

// Определяем интерфейс для пропсов компонента
interface VideoPlayerProps {
  /** Источник видеофайла */
  src: string;
  /** Скорость воспроизведения (по умолчанию 1.0) */
  playbackRate?: number;
  /** Автоматическое воспроизведение (по умолчанию false) */
  autoPlay?: boolean;
  /** Зацикленное воспроизведение (по умолчанию false) */
  loop?: boolean;
  /** Воспроизведение без звука (по умолчанию false) */
  muted?: boolean;
  /** Ширина видеоплеера (по умолчанию '100%') */
  width?: string | number;
  /** Высота видеоплеера (по умолчанию 'auto') */
  height?: string | number;
  /** Класс CSS для дополнительной стилизации */
  className?: string;
  /** Встроенные стили */
  style?: React.CSSProperties;
  // Можно добавить другие стандартные атрибуты <video> по необходимости
  // Например: controls?: boolean; poster?: string; preload?: 'auto' | 'metadata' | 'none';
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  playbackRate = 1.0, // Значение по умолчанию для скорости
  autoPlay = false,
  loop = false,
  muted = false,
  width = '100%',
  height = 'auto',
  className,
  style,
  ...rest // Собираем остальные пропсы, если они будут переданы
}) => {
  // Создаем ref для доступа к DOM-элементу <video>
  const videoRef = useRef<HTMLVideoElement>(null);

  // Эффект для обновления playbackRate при изменении соответствующего пропа
  useEffect(() => {
    if (videoRef.current) {
      // Устанавливаем скорость воспроизведения
      videoRef.current.playbackRate = playbackRate;
    }
    // Этот эффект должен зависеть только от playbackRate
  }, [playbackRate]);

  // Эффект для обработки изменения src и начальной загрузки/воспроизведения
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      // Если источник изменился, нужно перезагрузить видео
      // (Браузер может делать это автоматически, но load() гарантирует)
      videoElement.load();

      // Если включен autoPlay, пытаемся запустить воспроизведение
      if (autoPlay) {
        // Воспроизведение может быть заблокировано браузером, если нет взаимодействия пользователя
        // Поэтому используем .catch() для обработки возможной ошибки
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // Можно вывести предупреждение или обработать иначе
            console.warn(`[VideoPlayer] Autoplay prevented for src "${src}":`, error);
            // Часто браузеры требуют, чтобы видео было muted для автовоспроизведения
            if (!videoElement.muted) {
                 console.warn("[VideoPlayer] Consider adding the 'muted' prop for reliable autoplay.");
            }
          });
        }
      }
    }
    // Этот эффект зависит от src и autoPlay
  }, [src, autoPlay]);

  // Рендерим стандартный HTML5 <video> элемент
  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted} // Важно для надежного автовоспроизведения
      width={width}
      height={height}
      className={className}
      style={style}
      playsInline // Рекомендуется для мобильных браузеров, чтобы видео играло в элементе, а не в полноэкранном режиме
      {...rest} // Передаем остальные пропсы (например, controls, poster)
    >
      {/* Можно добавить текст для браузеров, не поддерживающих <video> */}
      Ваш браузер не поддерживает тег video.
    </video>
  );
};

export default VideoPlayer;
