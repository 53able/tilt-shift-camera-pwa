'use client';

import { useRef, useState } from 'react';

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert('カメラの起動に失敗しました');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      context.drawImage(videoRef.current, 0, 0);
      applyTiltShiftEffect(context);

      const dataUrl = canvasRef.current.toDataURL('image/png');
      setPhotoUrl(dataUrl);
    }
  };

  const applyTiltShiftEffect = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas;

    ctx.filter = 'blur(6px)';
    ctx.drawImage(ctx.canvas, 0, 0);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0.3, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 1)');

    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded shadow-md" />
      <div className="mt-4 space-x-4">
        <button onClick={startCamera} className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700">
          カメラ開始
        </button>
        <button onClick={capturePhoto} className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-700">
          写真を撮る
        </button>
      </div>
      {photoUrl && (
        <div className="mt-4">
          <img src={photoUrl} alt="Captured Photo" className="w-full max-w-md rounded shadow-md" />
          <a href={photoUrl} download="tilt-shift-photo.png" className="block mt-2 text-blue-500 hover:underline">
            写真をダウンロード
          </a>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
