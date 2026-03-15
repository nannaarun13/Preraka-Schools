
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSchool } from "@/contexts/SchoolContext";
import { useToast } from "@/hooks/use-toast";
import PhoneInput from "./PhoneInput";

const AdmissionForm = () => {
  const { dispatch } = useSchool();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    studentName: "",
    classApplied: "",
    previousClass: "",
    previousSchool: "",
    fatherName: "",
    motherName: "",
    primaryContact: "",
    secondaryContact: "",
    location: "",
    additionalInfo: "",
  });

  const classOptions = [
    "NURSERY",
    "LKG",
    "UKG",
    "CLASS 1",
    "CLASS 2",
    "CLASS 3",
    "CLASS 4",
    "CLASS 5",
    "CLASS 6",
    "CLASS 7",
  ];

  const getClassIndex = (className: string) => {
    return classOptions.indexOf(className);
  };

  const getAvailablePreviousClasses = () => {
    if (!formData.classApplied) return classOptions;

    const appliedIndex = getClassIndex(formData.classApplied);
    const maxIndex = appliedIndex === 0 ? 0 : appliedIndex - 1;

    return classOptions.slice(0, maxIndex + 1);
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const cleanDigits = digits.startsWith("91") ? digits.slice(2) : digits;
    const limitedDigits = cleanDigits.slice(0, 10);

    if (limitedDigits.length <= 5) {
      return limitedDigits;
    } else {
      return `${limitedDigits.slice(0, 5)} ${limitedDigits.slice(5)}`;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (
      ["studentName", "fatherName", "motherName", "location", "previousSchool"].includes(
        name
      )
    ) {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else if (["primaryContact", "secondaryContact"].includes(name)) {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "classApplied" && prev.previousClass) {
        const appliedIndex = getClassIndex(value);
        const previousIndex = getClassIndex(prev.previousClass);

        if (previousIndex >= appliedIndex) {
          newData.previousClass = "";
        }
      }

      return newData;
    });
  };

  const validateForm = () => {
    if (!formData.previousClass || !formData.classApplied) {
      toast({
        title: "Validation Error",
        description: "Please select both class applied for and previous class.",
        variant: "destructive",
      });
      return false;
    }

    const previousIndex = getClassIndex(formData.previousClass);
    const appliedIndex = getClassIndex(formData.classApplied);

    if (previousIndex >= appliedIndex) {
      toast({
        title: "Validation Error",
        description: "Previous class must be lower than class applied for.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.primaryContact.replace(/\s/g, "").length !== 10) {
      toast({
        title: "Validation Error",
        description: "Primary contact number must be exactly 10 digits.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const inquiryData = {
      id: Date.now().toString(),
      ...formData,
      presentClass: formData.previousClass,
      primaryContact: `+91 ${formData.primaryContact}`,
      secondaryContact: formData.secondaryContact
        ? `+91 ${formData.secondaryContact}`
        : "",
      submittedAt: new Date().toISOString(),
    };

    dispatch({ type: "ADD_ADMISSION_INQUIRY", payload: inquiryData });

    toast({
      title: "Application Submitted",
      description:
        "Your admission inquiry has been submitted successfully. We will contact you soon.",
    });

    setFormData({
      studentName: "",
      classApplied: "",
      previousClass: "",
      previousSchool: "",
      fatherName: "",
      motherName: "",
      primaryContact: "",
      secondaryContact: "",
      location: "",
      additionalInfo: "",
    });
  };

  return (
    <section className="animate-fade-in">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="bg-school-blue text-white rounded-t-lg">
          <CardTitle className="text-2xl text-center">
            Admission Inquiry Form
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">

              <div className="space-y-1">
                <Label htmlFor="studentName">Student Name *</Label>
                <Input
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  placeholder="ENTER STUDENT NAME"
                  required
                  className="uppercase h-11"
                />
              </div>

              <div className="space-y-1">
                <Label>Class Applied For *</Label>
                <Select
                  value={formData.classApplied}
                  onValueChange={(value) =>
                    handleSelectChange("classApplied", value)
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select class applied for" />
                  </SelectTrigger>

                  <SelectContent>
                    {classOptions.map((className) => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Previous Class *</Label>
                <Select
                  value={formData.previousClass}
                  onValueChange={(value) =>
                    handleSelectChange("previousClass", value)
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select previous class" />
                  </SelectTrigger>

                  <SelectContent>
                    {getAvailablePreviousClasses().map((className) => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Previous School</Label>
                <Input
                  name="previousSchool"
                  value={formData.previousSchool}
                  onChange={handleInputChange}
                  placeholder="ENTER PREVIOUS SCHOOL NAME"
                  className="uppercase h-11"
                />
              </div>

              <div className="space-y-1">
                <Label>Father's Name *</Label>
                <Input
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  placeholder="ENTER FATHER'S NAME"
                  required
                  className="uppercase h-11"
                />
              </div>

              <div className="space-y-1">
                <Label>Mother's Name *</Label>
                <Input
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  placeholder="ENTER MOTHER'S NAME"
                  required
                  className="uppercase h-11"
                />
              </div>

              <PhoneInput
                id="primaryContact"
                name="primaryContact"
                value={formData.primaryContact}
                onChange={handleInputChange}
                label="Primary Contact Number"
                required
              />

              <PhoneInput
                id="secondaryContact"
                name="secondaryContact"
                value={formData.secondaryContact}
                onChange={handleInputChange}
                label="Secondary Contact Number"
              />

              <div className="md:col-span-2 space-y-1">
                <Label>Location / Address *</Label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="ENTER YOUR LOCATION / ADDRESS"
                  required
                  className="uppercase h-11"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Additional Information</Label>
              <Textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                rows={4}
                placeholder="Any additional information you'd like to share"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-school-blue hover:bg-school-blue/90 text-white py-3 text-lg"
            >
              Submit Admission Inquiry
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default AdmissionForm;
```
