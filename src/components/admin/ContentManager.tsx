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
    welcomeMessage: "",
    email: "",
    phone: "",
    address: ""
  })

  /* ---------------- SYNC WITH CONTEXT ---------------- */

  useEffect(() => {

    if (!state?.data) return

    setGeneralContent({
      schoolName: state.data.schoolName || "",
      schoolLogo: state.data.schoolLogo || "",
      welcomeMessage: state.data.welcomeMessage || "",
      email: state.data.email || "",
      phone: state.data.phone || "",
      address: state.data.address || ""
    })

  }, [state])

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

      console.error(error)

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
                      <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2"/>
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
                <Label>School Name</Label>
                <Input
                  name="schoolName"
                  value={generalContent.schoolName}
                  onChange={handleInputChange}
                />
              </div>

              {/* WELCOME MESSAGE */}

              <div>
                <Label>Welcome Message</Label>
                <Input
                  name="welcomeMessage"
                  value={generalContent.welcomeMessage}
                  onChange={handleInputChange}
                />
              </div>

              {/* EMAIL */}

              <div>
                <Label>Email</Label>
                <Input
                  name="email"
                  value={generalContent.email}
                  onChange={handleInputChange}
                />
              </div>

              {/* PHONE */}

              <div>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={generalContent.phone}
                  onChange={handleInputChange}
                />
              </div>

              {/* ADDRESS */}

              <div>
                <Label>Address</Label>
                <Textarea
                  name="address"
                  rows={3}
                  value={generalContent.address}
                  onChange={handleInputChange}
                />
              </div>

            </CardContent>

          </Card>

        </TabsContent>

        {/* UPDATES */}

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
