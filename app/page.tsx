"use client";

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-white">
      <h1 className="text-4xl font-bold mb-8 text-center">MindMint</h1>
      
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="image-input" className="text-lg font-medium">
            Upload Images:
          </label>
          <input
            id="image-input"
            type="file"
            accept="image/*"
            multiple
            className="p-2 border border-gray-300 rounded"
          />
        </div>

        <canvas
          className="w-full border border-gray-300 rounded"
          height="400"
          aria-label="Visualization canvas for mind-movie display"
          role="img"
        />
      </div>
    </div>
  );
}
