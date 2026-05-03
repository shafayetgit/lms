const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1";
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "uploads";

console.log("Cloudinary Config:", {
  CLOUD_NAME,
  UPLOAD_PRESET,
  FOLDER,
});

export async function uploadToCloudinary({
  file,
  cloudName = CLOUD_NAME,
  uploadPreset = UPLOAD_PRESET,
  folder = FOLDER,
  signal,
}) {
  if (!file) throw new Error("File is required");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  if (folder) {
    formData.append("folder", folder);
  }

  const res = await fetch(`${CLOUDINARY_URL}/${cloudName}/upload`, {
    method: "POST",
    body: formData,
    signal,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Upload failed");
  }

  const data = await res.json();

  return {
    url: data.secure_url,
    public_id: data.public_id,
    type: data.resource_type,
    original: data,
  };
}
// Usage;
// const result = await uploadToCloudinary({
//   file,
//   cloudName: "your_cloud",
//   uploadPreset: "your_preset",
//   folder: "uploads",
// });

export async function uploadMultipleToCloudinary({
  files,
  cloudName = CLOUD_NAME,
  uploadPreset = UPLOAD_PRESET,
  folder = FOLDER,
  concurrency = 3,
}) {
  const results = [];
  const queue = [...files];

  async function worker() {
    while (queue.length) {
      const file = queue.shift();
      try {
        const uploaded = await uploadToCloudinary({
          file,
          cloudName,
          uploadPreset,
          folder,
        });
        results.push(uploaded);
      } catch (err) {
        console.error("Upload failed:", file.name, err);
      }
    }
  }

  const workers = Array(concurrency).fill(null).map(worker);
  await Promise.all(workers);

  return results;
}

// Usage
// const results = await uploadMultipleToCloudinary({
//   files: Array.from(e.target.files),
//   cloudName: "your_cloud",
//   uploadPreset: "your_preset",
// });
