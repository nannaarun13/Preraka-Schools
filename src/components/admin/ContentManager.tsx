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
    welcomeMessage: "",
    welcomeImage: "",
    aboutContent: "",
    missionStatement: "",
    visionStatement: "",
    schoolLogo: "",
    schoolName: "",
    schoolNameImage: ""
  })

  /* ---------------- SYNC FORM WITH CONTEXT ---------------- */

  useEffect(() => {

    setGeneralContent({
      welcomeMessage: state.data.welcomeMessage,
      welcomeImage: state.data.welcomeImage,
      aboutContent: state.data.aboutContent,
      missionStatement: state.data.missionStatement,
      visionStatement: state.data.visionStatement,
      schoolLogo: state.data.schoolLogo,
      schoolName: state.data.schoolName,
      schoolNameImage: state.data.schoolNameImage || ""
    })

  }, [state.data])

  /* ---------------- INPUT CHANGE ---------------- */

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
        description: "School content saved successfully."
      })

    } catch (error) {

      console.error("Save failed:", error)

      toast({
        title: "Save Failed",
        description: "Could not save your changes.",
        variant: "destructive"
      })

    }

    setIsSaving(false)
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Content Management
        </h2>
      </div>

      <Tabs defaultValue="general" className="space-y-6">

        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General Content</TabsTrigger>
          <TabsTrigger value="updates">Latest Updates</TabsTrigger>
          <TabsTrigger value="founders">Founders</TabsTrigger>
        </TabsList>

        {/* GENERAL CONTENT */}

        <TabsContent value="general">

          <Card>

            <CardHeader>

              <div className="flex items-center justify-between">

                <CardTitle>General School Content</CardTitle>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-school-blue hover:bg-school-blue/90"
                >

                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}

                </Button>

              </div>

            </CardHeader>

            <CardContent className="space-y-6">

              {/* SCHOOL LOGO */}

              <ImageUpload
                label="School Logo"
                currentImage={generalContent.schoolLogo}
                onImageUpload={(url) =>
                  setGeneralContent(prev => ({
                    ...prev,
                    schoolLogo: url
                  }))
                }
              />

              {/* SCHOOL NAME */}

              <div>
                <Label htmlFor="schoolName">School Name</Label>

                <Input
                  id="schoolName"
                  name="schoolName"
                  value={generalContent.schoolName}
                  onChange={handleInputChange}
                />
              </div>

              {/* SCHOOL NAME IMAGE */}

              <ImageUpload
                label="School Name Image"
                currentImage={generalContent.schoolNameImage}
                onImageUpload={(url) =>
                  setGeneralContent(prev => ({
                    ...prev,
                    schoolNameImage: url
                  }))
                }
              />

              {/* WELCOME MESSAGE */}

              <div>

                <Label htmlFor="welcomeMessage">Welcome Message</Label>

                <Input
                  id="welcomeMessage"
                  name="welcomeMessage"
                  value={generalContent.welcomeMessage}
                  onChange={handleInputChange}
                />

              </div>

              {/* WELCOME IMAGE */}

              <ImageUpload
                label="Welcome Image"
                currentImage={generalContent.welcomeImage}
                onImageUpload={(url) =>
                  setGeneralContent(prev => ({
                    ...prev,
                    welcomeImage: url
                  }))
                }
              />

              {/* ABOUT */}

              <div>

                <Label htmlFor="aboutContent">About Content</Label>

                <Textarea
                  id="aboutContent"
                  name="aboutContent"
                  rows={4}
                  value={generalContent.aboutContent}
                  onChange={handleInputChange}
                />

              </div>

              {/* MISSION */}

              <div>

                <Label htmlFor="missionStatement">Mission Statement</Label>

                <Textarea
                  id="missionStatement"
                  name="missionStatement"
                  rows={3}
                  value={generalContent.missionStatement}
                  onChange={handleInputChange}
                />

              </div>

              {/* VISION */}

              <div>

                <Label htmlFor="visionStatement">Vision Statement</Label>

                <Textarea
                  id="visionStatement"
                  name="visionStatement"
                  rows={3}
                  value={generalContent.visionStatement}
                  onChange={handleInputChange}
                />

              </div>

            </CardContent>

          </Card>

        </TabsContent>

        {/* LATEST UPDATES */}

        <TabsContent value="updates">
          <LatestUpdatesManager />
        </TabsContent>

        {/* FOUNDERS */}

        <TabsContent value="founders">
          <FoundersManager />
        </TabsContent>

      </Tabs>

    </div>
  )
}

export default ContentManager
