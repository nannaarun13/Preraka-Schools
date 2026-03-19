import React, { createContext, useContext, useReducer, useEffect } from "react"
import { subscribeToSchoolData, updateSchoolData } from "@/utils/schoolDataUtils"

/* ---------------- TYPES ---------------- */

export interface Notice {
  id?: string
  title: string
  content: string
  date: string
}

export interface GalleryImage {
  id?: string
  url: string
  caption?: string
  category?: string
  date?: string
}

export interface AdmissionInquiry {
  id?: string
  studentName: string
  fatherName: string
  motherName: string
  primaryContact: string
  classApplied: string
  location?: string
  submittedAt?: string
}

export interface Founder {
  id?: string
  name: string
  details: string
  image: string
}

export interface LatestUpdate {
  id?: string
  content: string
  date: string
}

export interface ContactNumber {
  id: string
  label: string
  number: string
}

export interface ContactInfo {
  address: string
  email: string
  phone: string
  contactNumbers: ContactNumber[]
  mapEmbed?: string
}

/* ---------------- SCHOOL DATA ---------------- */

export interface SchoolData {
  schoolName: string
  schoolLogo: string
  welcomeMessage: string

  welcomeImage?: string
  schoolNameImage?: string

  // ✅ ABOUT PAGE FIELDS
  history?: string
  about?: string
  mission?: string
  vision?: string

  notices: Notice[]
  galleryImages: GalleryImage[]
  admissionInquiries: AdmissionInquiry[]

  founders: Founder[]
  latestUpdates: LatestUpdate[]
  contactInfo: ContactInfo
}

/* ---------------- STATE ---------------- */

interface SchoolState {
  data: SchoolData
}

/* ---------------- ACTIONS ---------------- */

type SchoolAction =
  | { type: "SET_DATA"; payload: SchoolData }
  | { type: "UPDATE_SCHOOL_DATA"; payload: Partial<SchoolData> }

/* ---------------- DEFAULT DATA ---------------- */

export const defaultSchoolData: SchoolData = {
  schoolName: "Preraka Schools",
  schoolLogo: "",
  welcomeMessage: "Welcome to Preraka Schools",

  welcomeImage: "",
  schoolNameImage: "",

  history: "",
  about: "",
  mission: "",
  vision: "",

  notices: [],
  galleryImages: [],
  admissionInquiries: [],

  founders: [],
  latestUpdates: [],

  contactInfo: {
    address: "",
    email: "",
    phone: "",
    contactNumbers: [],
    mapEmbed: ""
  }
}

/* ---------------- REDUCER ---------------- */

const schoolReducer = (state: SchoolState, action: SchoolAction): SchoolState => {

  switch (action.type) {

    case "SET_DATA":
      return {
        ...state,
        data: {
          ...defaultSchoolData,
          ...action.payload
        }
      }

    case "UPDATE_SCHOOL_DATA":
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload
        }
      }

    default:
      return state
  }
}

/* ---------------- CONTEXT ---------------- */

const SchoolContext = createContext<{
  state: SchoolState
  dispatch: React.Dispatch<SchoolAction>
  updateData: (payload: Partial<SchoolData>) => Promise<void>
} | undefined>(undefined)

/* ---------------- HOOK ---------------- */

export const useSchool = () => {
  const context = useContext(SchoolContext)

  if (!context) {
    throw new Error("useSchool must be used inside SchoolProvider")
  }

  return context
}

/* ---------------- PROVIDER ---------------- */

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // ✅ INSTANT LOAD (NO DELAY)
  const [state, dispatch] = useReducer(schoolReducer, {
    data: defaultSchoolData
  })

  useEffect(() => {

    console.log("🔥 Firestore subscription started")

    const unsubscribe = subscribeToSchoolData(

      (data) => {

        console.log("✅ Firestore Data:", data)

        dispatch({
          type: "SET_DATA",
          payload: {
            ...defaultSchoolData,
            ...data
          }
        })

      },

      (error) => {
        console.error("❌ Firestore error:", error)
      }

    )

    return () => {
      if (unsubscribe) unsubscribe()
    }

  }, [])

  const updateData = async (payload: Partial<SchoolData>) => {

    // ✅ Instant UI update
    dispatch({
      type: "UPDATE_SCHOOL_DATA",
      payload
    })

    try {
      await updateSchoolData(payload)
    } catch (error) {
      console.error("Firestore update failed:", error)
    }
  }

  return (
    <SchoolContext.Provider value={{ state, dispatch, updateData }}>
      {children}
    </SchoolContext.Provider>
  )
}
