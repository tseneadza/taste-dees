"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  value: string;
  onChange: (path: string) => void;
  error?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ImageUploader({ value, onChange, error: externalError }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when value changes
  useEffect(() => {
    if (value) {
      setPreviewUrl(value);
    }
  }, [value]);

  // Validate file type and size
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Selected format is not valid for this site. Please use JPG, PNG, or WebP.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Image is too large. Maximum size is 5MB.";
    }
    return null;
  };

  // Upload file to server
  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || "Upload failed. Please check your connection and try again.");
        return;
      }

      // Success - update value and preview
      onChange(data.path);
      setPreviewUrl(data.path);
      setUrlInput("");
    } catch (err) {
      setErrorMessage("Upload failed. Please check your connection and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection (from drop or input)
  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    uploadFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setErrorMessage(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  // File input change handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Click to browse
  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  // URL input handler
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setUrlInput(url);
    setErrorMessage(null);

    if (!url) {
      if (!value) {
        setPreviewUrl(null);
      }
      return;
    }

    // Validate URL by trying to load the image
    setIsLoadingUrl(true);
    const img = new window.Image();
    img.onload = () => {
      setPreviewUrl(url);
      onChange(url);
      setIsLoadingUrl(false);
      setErrorMessage(null);
    };
    img.onerror = () => {
      setIsLoadingUrl(false);
      setErrorMessage("Could not load image from URL. Please check the link.");
    };
    img.src = url;
  };

  // Clear/change image
  const handleClear = () => {
    onChange("");
    setPreviewUrl(null);
    setUrlInput("");
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayError = errorMessage || externalError;
  const showPreview = previewUrl && !isUploading && !isLoadingUrl;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative min-h-[200px] rounded-2xl border-2 border-dashed transition-colors cursor-pointer
          ${isDragging
            ? "border-accent bg-accent/5"
            : displayError
              ? "border-red-500 bg-red-50 dark:bg-red-900/10"
              : "border-card-border bg-card-bg hover:border-accent"
          }
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {showPreview ? (
          /* Preview State */
          <div className="relative w-full h-[267px] flex items-center justify-center p-4">
            <div className="relative w-[200px] h-[267px] rounded-xl overflow-hidden border-2 border-solid border-accent/50">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover object-top"
                sizes="200px"
              />
              {/* Change button overlay */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 text-white text-sm rounded-full hover:bg-black/90 transition-colors"
              >
                Change image
              </button>
            </div>
            {/* Checkmark indicator */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
          </div>
        ) : isUploading || isLoadingUrl ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center h-[200px] gap-3">
            <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-muted">{isUploading ? "Uploading..." : "Loading..."}</span>
          </div>
        ) : (
          /* Default State */
          <div className="flex flex-col items-center justify-center h-[200px] gap-3 p-6">
            {/* Upload icon */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDragging ? "bg-accent/20 text-accent" : "bg-card-border/50 text-muted"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
            </div>
            <div className="text-center">
              <p className={`font-medium ${isDragging ? "text-accent" : "text-foreground"}`}>
                Drag & drop your image here
              </p>
              <p className="text-sm text-muted">or click to browse</p>
            </div>
            <p className="text-xs text-muted">
              Supported formats: JPG, PNG, WebP (max 5MB)
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {displayError && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          {displayError}
        </div>
      )}

      {/* OR divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-card-border" />
        <span className="text-sm text-muted">OR</span>
        <div className="flex-1 h-px bg-card-border" />
      </div>

      {/* URL Input */}
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-muted mb-1">
          Image URL
        </label>
        <input
          id="imageUrl"
          type="url"
          value={urlInput}
          onChange={handleUrlChange}
          placeholder="https://example.com/image.jpg"
          className={`
            w-full rounded-md border p-2 bg-white dark:bg-card-bg transition-colors
            ${displayError && urlInput ? "border-red-500" : "border-card-border"}
          `}
          disabled={isUploading}
        />
      </div>
    </div>
  );
}
