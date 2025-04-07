"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageComponentProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageComponent({
  src,
  alt,
  className = "",
}: ImageComponentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div
      className={`relative aspect-video bg-gray-800 rounded-lg overflow-hidden ${className}`}
    >
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-400">Failed to load image</span>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={alt}
              fill
              className={`object-cover transition-opacity duration-300 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoadingComplete={() => setIsLoading(false)}
              onError={() => {
                console.error("Failed to load image:", src);
                setIsLoading(false);
                setError(true);
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={80}
            />
          </div>
        </>
      )}
    </div>
  );
}
