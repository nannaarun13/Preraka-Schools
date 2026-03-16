import React, { createContext, useContext, useReducer, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { subscribeToSchoolData, updateSchoolData } from "../utils/schoolDataUtils"

/* ---------------- TYPES ---------------- */

export interface Notice {
  id?: string
  title: string
  content: string
  type: string
  date: string
}

export interface GalleryImage {
  id?: string
  url: string
  caption?: string
}

export interface Admission {
  id?: string
  studentName: string
  parentName: string
  phone: string
  class: string
}

export interface SchoolData {
  schoolName: string
  schoolLogo: string
  welcomeMessage: string
  email: string
  phone: string
  address: string
  notices: Notice[]
  gallery: GalleryImage[]
  admissions: Admission[]
}

interface SchoolState {
  data: SchoolData
  loading: boolean
}

type SchoolAction =
  | { type: "SET_DATA"; payload: SchoolData }
  | { type: "UPDATE_DATA"; payload: Partial<SchoolData> }

/* ---------------- DEFAULT DATA ---------------- */

export const defaultSchoolData: SchoolData = {
  schoolName: "Preraka Schools",
  schoolLogo: "",
  welcomeMessage: "Welcome to Preraka Schools",
  email: "info@school.edu",
  phone: "+91 9876543210",
  address: "",
  notices: [],
  gallery: [],
  admissions: []
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

    case "UPDATE_DATA":
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
          payload: data || defaultSchoolData
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

    dispatch({
      type: "UPDATE_DATA",
      payload
    })

    try {

      await updateSchoolData(payload)

    } catch (error) {

      console.error("Firestore update failed:", error)

    }
  }

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
        updateData
      }}
    >
      {children}
    </SchoolContext.Provider>
  )
}
