import { useState } from "react";

export default function UploadImageForm({
  onImageSelect,
}: {
  onImageSelect: (file: File | null) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      onImageSelect(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg border-gray-300">
      <div
        className={`w-full h-20 flex items-center justify-center rounded-lg cursor-pointer transition-all ${
          isDragging ? "bg-blue-100 border-blue-500" : "bg-gray-100"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <p className="text-gray-500 text-center">
            Drag and drop an image here, or click to select a file
          </p>
        )}
      </div>
      <input
        type="file"
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
        id="file-input"
      />
      <label
        htmlFor="file-input"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
      >
        Choose File
      </label>
    </div>
  );
}