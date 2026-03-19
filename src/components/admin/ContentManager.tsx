import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSchool } from "@/contexts/SchoolContext"
import { useToast } from "@/hooks/use-toast"
import { Save, Loader2 } from "lucide-react"

import ImageUpload from "./ImageUpload"
import LatestUpdatesManager from "./LatestUpdatesManager"
import FoundersManager from "./FoundersManager"

const ContentManager = () => {

  const { state, updateData } = useSchool()
  const { toast } = useToast()

  const [isSaving, setIsSaving] = useState(false)

  const [generalContent, setGeneralContent] = useState({
    schoolName: "",
    schoolLogo: "",
    schoolNameImage: "",
    welcomeMessage: "",
    welcomeImage: "",

    // ✅ NEW ABOUT PAGE DATA
    history: "",
    about: "",
    mission: "",
    vision: ""
  })

  /* ---------------- SYNC ---------------- */

  useEffect(() => {

    if (!state?.data) return

    setGeneralContent({
      schoolName: state.data.schoolName || "",
      schoolLogo: state.data.schoolLogo || "",
      schoolNameImage: state.data.schoolNameImage || "",
      welcomeMessage: state.data.welcomeMessage || "",
      welcomeImage: state.data.welcomeImage || "",

      history: state.data.history || "",
      about: state.data.about || "",
      mission: state.data.mission || "",
      vision: state.data.vision || ""
    })

  }, [state.data])

  /* ---------------- INPUT ---------------- */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {

    const { name, value } = e.target

    setGeneralContent(prev => ({
      ...prev,
      [name]: value
    }))
  }

  /* ---------------- SAVE ---------------- */

  const handleSave = async () => {

    setIsSaving(true)

    try {

      await updateData(generalContent)

      toast({
        title: "Content Updated",
        description: "Saved successfully"
      })

    } catch (error) {

      toast({
        title: "Error",
        description: "Failed to save",
        variant: "destructive"
      })

    } finally {
      setIsSaving(false)
    }
  }

  /* ---------------- UI ---------------- */

  return (

    <div className="space-y-6">

      <h2 className="text-xl font-semibold text-gray-800">
        Content Management
      </h2>

      <Tabs defaultValue="general" className="space-y-6">

        <TabsList className="flex gap-2 bg-gray-100 p-2 rounded-lg">
          <TabsTrigger value="general">General Content</TabsTrigger>
          <TabsTrigger value="updates">Latest Updates</TabsTrigger>
          <TabsTrigger value="founders">Founders</TabsTrigger>
        </TabsList>

        {/* ================= GENERAL ================= */}

        <TabsContent value="general">

          <Card className="max-w-4xl mx-auto rounded-xl shadow-md border">

            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>General School Content</CardTitle>

              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
            </CardHeader>

            <CardContent className="space-y-8">

              {/* LOGO + NAME */}
              <div className="grid md:grid-cols-2 gap-6">

                <ImageUpload
                  label="School Logo"
                  currentImage={generalContent.schoolLogo}
                  onImageUpload={(url) =>
                    setGeneralContent(prev => ({ ...prev, schoolLogo: url }))
                  }
                />

                <div>
                  <Label>School Name</Label>
                  <Input
                    name="schoolName"
                    value={generalContent.schoolName}
                    onChange={handleInputChange}
                  />
                </div>

              </div>

              {/* NAME IMAGE */}
              <ImageUpload
                label="School Name Image"
                currentImage={generalContent.schoolNameImage}
                onImageUpload={(url) =>
                  setGeneralContent(prev => ({ ...prev, schoolNameImage: url }))
                }
              />

              {/* WELCOME */}
              <div>
                <Label>Welcome Message</Label>
                <Input
                  name="welcomeMessage"
                  value={generalContent.welcomeMessage}
                  onChange={handleInputChange}
                />
              </div>

              <ImageUpload
                label="Welcome Background Image"
                currentImage={generalContent.welcomeImage}
                onImageUpload={(url) =>
                  setGeneralContent(prev => ({ ...prev, welcomeImage: url }))
                }
              />

              {/* ================= ABOUT PAGE DATA ================= */}

              <div>
                <Label>Our History</Label>
                <Textarea
                  name="history"
                  value={generalContent.history}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>About Content</Label>
                <Textarea
                  name="about"
                  value={generalContent.about}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Mission Statement</Label>
                <Textarea
                  name="mission"
                  value={generalContent.mission}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Vision Statement</Label>
                <Textarea
                  name="vision"
                  value={generalContent.vision}
                  onChange={handleInputChange}
                />
              </div>

            </CardContent>

          </Card>

        </TabsContent>

        {/* ================= OTHER TABS ================= */}

        <TabsContent value="updates">
          <LatestUpdatesManager />
        </TabsContent>

        <TabsContent value="founders">
          <FoundersManager />
        </TabsContent>

      </Tabs>

    </div>
  )
}

export default ContentManager
