import video from "../assets/footage.mp4";
import React, { useEffect, useRef, useState } from "react";

const asciiChars = "58741230"; // darkest to lightest

const VideoAsciiOverlay = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ascii, setAscii] = useState("");
  const [videoRect, setVideoRect] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const charWidth = 9.1;
  const charHeight = 12;

  const getAsciiChar = (brightness) => {
    const index = Math.floor(brightness * (asciiChars.length - 1));
    return asciiChars[index];
  };

  const drawAscii = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!video || !canvas || !ctx) return;

    // Get updated video position and size
    const rect = video.getBoundingClientRect();
    setVideoRect(rect);

    const cols = Math.floor(rect.width / charWidth);
    const rows = Math.floor(rect.height / charHeight);

    canvas.width = cols;
    canvas.height = rows;

    // Draw the video into the canvas for pixel sampling
    ctx.drawImage(video, 0, 0, cols, rows);
    const frame = ctx.getImageData(0, 0, cols, rows);
    const data = frame.data;

    let asciiStr = "";

    for (let y = 0; y < rows; y++) {
      let row = "";
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const avg = (r + g + b) / 3;
        const brightness = avg / 255;
        row += getAsciiChar(brightness);
      }
      asciiStr += row + "\n";
    }

    setAscii(asciiStr);
    requestAnimationFrame(drawAscii);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener("play", drawAscii);
    }

    return () => {
      if (video) {
        video.removeEventListener("play", drawAscii);
      }
    };
  }, []);

  // Generate screen-sized filler with darkest char
  const screenCols = Math.floor(window.innerWidth / charWidth);
  const screenRows = Math.floor(window.innerHeight / charHeight);
  const darkChar = asciiChars[5];

  let fullAscii = Array(screenRows)
    .fill(darkChar.repeat(screenCols))
    .map((row) => row.split(""));

  // Inject the ASCII video block at its position
  const offsetX = Math.floor(videoRect.left / charWidth);
  const offsetY = Math.floor(videoRect.top / charHeight);
  const asciiLines = ascii.split("\n");

  asciiLines.forEach((line, rowIdx) => {
    if (rowIdx + offsetY >= screenRows) return;
    const chars = line.split("");
    chars.forEach((char, colIdx) => {
      if (colIdx + offsetX >= screenCols) return;
      fullAscii[rowIdx + offsetY][colIdx + offsetX] = char;
    });
  });

  const finalAscii = fullAscii.map((line) => line.join("")).join("\n");

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-mono text-xs leading-none text-white">
      {/* Video with responsive width and auto height */}
      <video
        ref={videoRef}
        className="absolute top-0 w-full h-auto z-10"
        autoPlay
        muted
        loop
        src={video} // Replace with actual video source
      />

      {/* Hidden canvas for pixel sampling */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ASCII overlay */}
      <div className="absolute inset-0 z-20 whitespace-pre pointer-events-none font-[glyphs] bg-black bg-opacity-60">{finalAscii}</div>
    </div>
  );
};

export default VideoAsciiOverlay;
