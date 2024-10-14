'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

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
      console.error('Error starting camera:', error);
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

  // 全体に強いぼかしを適用
  ctx.filter = 'blur(5px)';
  ctx.drawImage(ctx.canvas, 0, 0);

  // 鮮明な部分を作るためのグラデーション
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
  gradient.addColorStop(0.8, 'rgba(255, 255, 255, 1)');

  // 合成モードでグラデーションを適用
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 合成モードをリセット
  ctx.globalCompositeOperation = 'source-over';

  // 色のコントラストと彩度を強調する（疑似的にエフェクトを強調）
  enhanceColor(ctx, width, height);
};

const enhanceColor = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // 各ピクセルのRGB値を強調 (コントラスト強化)
    data[i] = Math.min(255, data[i] * 1.2); // Red
    data[i + 1] = Math.min(255, data[i + 1] * 1.2); // Green
    data[i + 2] = Math.min(255, data[i + 2] * 1.2); // Blue
  }

  ctx.putImageData(imageData, 0, 0);
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded shadow-md" />
      <div className="mt-4 space-x-4">
        <button
          onClick={startCamera}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700"
        >
          カメラ開始
        </button>
        <button
          onClick={capturePhoto}
          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-700"
        >
          写真を撮る
        </button>
      </div>
      {photoUrl && (
        <div className="mt-4">
          <Image
            src={photoUrl}
            alt="Captured Photo"
            width={500}
            height={500}
            className="w-full max-w-md rounded shadow-md"
          />
          <a
            href={photoUrl}
            download="tilt-shift-photo.png"
            className="block mt-2 text-blue-500 hover:underline"
          >
            写真をダウンロード
          </a>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
