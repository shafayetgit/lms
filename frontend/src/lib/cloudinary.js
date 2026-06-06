const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1";
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "uploads";

// console.log("Cloudinary Config:", {
//   CLOUD_NAME,
//   UPLOAD_PRESET,
//   FOLDER,
// });

export async function uploadToCloudinary({
  file,
  cloudName = CLOUD_NAME,
  uploadPreset = UPLOAD_PRESET,
  folder = FOLDER,
  signal,
  onProgress,
}) {
  if (!file) throw new Error("File is required");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  if (folder) {
    formData.append("folder", folder);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${CLOUDINARY_URL}/${cloudName}/upload`;

    xhr.open("POST", url, true);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded * 100) / e.total);
          onProgress(percentComplete, e.loaded, e.total);
        }
      };
    }

    if (signal) {
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new DOMException("Aborted", "AbortError"));
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (e) {
          reject(new Error("Invalid JSON response"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || "Upload failed"));
        } catch (e) {
          reject(new Error("Upload failed"));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Upload failed"));
    };

    xhr.send(formData);
  });
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
        const meta = await uploadToCloudinary({
          file: file.file,
          cloudName,
          uploadPreset,
          folder,
          onProgress: file.onProgress,
        });

        delete file.file; 
        delete file.onProgress;

        results.push({
          ...file,
          meta: meta,
        });
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
