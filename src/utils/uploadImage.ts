export const uploadImage = async (file: File): Promise<string> => {

  /* ---------------- VALIDATION ---------------- */

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ]

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPG, PNG, and WEBP images are allowed")
  }

  const maxSizeMB = 5
  const maxSize = maxSizeMB * 1024 * 1024

  if (file.size > maxSize) {
    throw new Error(`Image must be smaller than ${maxSizeMB}MB`)
  }

  /* ---------------- UPLOAD ---------------- */

  const formData = new FormData()

  formData.append("file", file)
  formData.append("upload_preset", "school_upload")

  try {

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dpie6aqzf/image/upload",
      {
        method: "POST",
        body: formData
      }
    )

    if (!response.ok) {
      throw new Error("Image upload failed")
    }

    const data = await response.json()

    if (!data?.secure_url) {
      throw new Error("Invalid upload response")
    }

    return data.secure_url

  } catch (error) {

    console.error("Cloudinary upload error:", error)

    throw new Error("Failed to upload image")

  }
}
