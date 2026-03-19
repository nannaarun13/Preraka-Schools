import React, { createContext, useContext, useReducer, useEffect } from "react"
import { Loader2 } from "lucide-react"
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

/* ✅ UPDATED SCHOOL DATA */

export interface SchoolData {
  schoolName: string
  schoolLogo: string
  welcomeMessage: string

  // ✅ NEW FIELDS (IMPORTANT)
  welcomeImage?: string
  schoolNameImage?: string

  email: string
  phone: string
  address: string

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
  loading: boolean
}

/* ---------------- ACTIONS ---------------- */

type SchoolAction =
  | { type: "SET_DATA"; payload: SchoolData }
  | { type: "UPDATE_SCHOOL_DATA"; payload: Partial<SchoolData> }
  | { type: "ADD_NOTICE"; payload: Notice }
  | { type: "DELETE_NOTICE"; payload: string }
  | { type: "ADD_GALLERY_IMAGE"; payload: GalleryImage }
  | { type: "DELETE_GALLERY_IMAGE"; payload: string }
  | { type: "ADD_LATEST_UPDATE"; payload: LatestUpdate }
  | { type: "DELETE_LATEST_UPDATE"; payload: string }
  | { type: "ADD_FOUNDER"; payload: Founder }
  | { type: "DELETE_FOUNDER"; payload: string }

/* ---------------- DEFAULT DATA ---------------- */

export const defaultSchoolData: SchoolData = {
  schoolName: "Preraka Schools",
  schoolLogo: "",
  welcomeMessage: "Welcome to Preraka Schools",

  // ✅ NEW DEFAULTS
  welcomeImage: "",
  schoolNameImage: "",

  email: "info@school.edu",
  phone: "+91 9876543210",
  address: "",

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

const initialState: SchoolState = {
  data: defaultSchoolData,
  loading: true
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
        },
        loading: false
      }

    case "UPDATE_SCHOOL_DATA":
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload
        }
      }

    case "ADD_NOTICE":
      return {
        ...state,
        data: {
          ...state.data,
          notices: [...state.data.notices, action.payload]
        }
      }

    case "DELETE_NOTICE":
      return {
        ...state,
        data: {
          ...state.data,
          notices: state.data.notices.filter(n => n.id !== action.payload)
        }
      }

    case "ADD_GALLERY_IMAGE":
      return {
        ...state,
        data: {
          ...state.data,
          galleryImages: [...state.data.galleryImages, action.payload]
        }
      }

    case "DELETE_GALLERY_IMAGE":
      return {
        ...state,
        data: {
          ...state.data,
          galleryImages: state.data.galleryImages.filter(i => i.id !== action.payload)
        }
      }

    case "ADD_LATEST_UPDATE":
      return {
        ...state,
        data: {
          ...state.data,
          latestUpdates: [...state.data.latestUpdates, action.payload]
        }
      }

    case "DELETE_LATEST_UPDATE":
      return {
        ...state,
        data: {
          ...state.data,
          latestUpdates: state.data.latestUpdates.filter(u => u.id !== action.payload)
        }
      }

    case "ADD_FOUNDER":
      return {
        ...state,
        data: {
          ...state.data,
          founders: [...state.data.founders, action.payload]
        }
      }

    case "DELETE_FOUNDER":
      return {
        ...state,
        data: {
          ...state.data,
          founders: state.data.founders.filter(f => f.id !== action.payload)
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

  const [state, dispatch] = useReducer(schoolReducer, initialState)

  useEffect(() => {

    const unsubscribe = subscribeToSchoolData(

      (data) => {

        dispatch({
          type: "SET_DATA",
          payload: {
            ...defaultSchoolData,
            ...data
          }
        })

      },

      (error) => {

        console.error("Firestore error:", error)

        dispatch({
          type: "SET_DATA",
          payload: defaultSchoolData
        })

      }

    )

    return () => {
      if (unsubscribe) unsubscribe()
    }

  }, [])

  const updateData = async (payload: Partial<SchoolData>) => {

    // ✅ Optimistic UI update
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

  /* LOADING SCREEN */

  if (state.loading) {

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    )

  }

  return (

    <SchoolContext.Provider
      value={{
        state,
        dispatch,
        updateData
      }}
    >

      {children}

    </SchoolContext.Provider>

  )

}
