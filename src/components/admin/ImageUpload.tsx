
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, Loader2 } from "lucide-react"

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  currentImage?: string
  label: string
  accept?: string
}

const ImageUpload = ({
  onImageUpload,
  currentImage,
  label,
  accept = "image/*"
}: ImageUploadProps) => {

  const { toast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string>(currentImage || "")
  const [uploading, setUploading] = useState(false)

  const uploadToCloudinary = async (file: File) => {

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

    if (!response.ok) {
      throw new Error("Cloudinary upload failed")
    }

    const data = await response.json()

    return data.secure_url
  }

  const handleFile = async (file: File) => {

    if (!file.type.startsWith("image/")) {

      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive"
      })

      return
    }

    try {

      setUploading(true)

      const imageUrl = await uploadToCloudinary(file)

      if (!imageUrl) throw new Error("No URL returned")

      setPreview(imageUrl)

      onImageUpload(imageUrl)

      toast({
        title: "Upload Successful",
        description: "Image uploaded to Cloudinary"
      })

    } catch (error) {

      console.error("Upload error:", error)

      toast({
        title: "Upload Failed",
        description: "Could not upload image",
        variant: "destructive"
      })

    } finally {

      setUploading(false)

    }
  }

  const handleDrop = (e: React.DragEvent) => {

    e.preventDefault()
    e.stopPropagation()

    setDragActive(false)

    const files = e.dataTransfer.files

    if (files && files[0]) handleFile(files[0])
  }

  const handleDrag = (e: React.DragEvent) => {

    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else {
      setDragActive(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {

    const files = e.target.files

    if (files && files[0]) handleFile(files[0])
  }

  const removeImage = () => {

    setPreview("")
    onImageUpload("")

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">

      <Label>{label}</Label>

      {preview ? (
        <div className="relative inline-block">

          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border"
          />

          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>

        </div>
      ) : (

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-school-blue bg-school-blue-light"
              : "border-gray-300 hover:border-school-blue"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >

          {uploading ? (
            <Loader2 className="h-10 w-10 animate-spin mx-auto" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          )}

          <p className="text-gray-600">
            Drag & drop an image here, or click to select
          </p>

          <Button type="button" variant="outline" className="mt-2">
            Choose File
          </Button>

        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />

    </div>
  )
}

export default ImageUpload
