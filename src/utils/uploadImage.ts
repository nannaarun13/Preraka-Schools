export const uploadImage = async (file: File) => {

  const formData = new FormData()

  formData.append("file", file)
  formData.append("upload_preset", "school_upload")

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dpie6aqzf/image/upload",
    {
      method: "POST",
      body: formData
    }
  )

  const data = await response.json()

  return data.secure_url
}
```
