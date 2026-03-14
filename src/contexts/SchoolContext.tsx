import React, { createContext, useContext, useReducer, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { Unsubscribe } from "firebase/firestore";
import { subscribeToSchoolData, updateSchoolData } from "../utils/schoolDataUtils";

/* ---------------- TYPES ---------------- */

export interface NavigationItem {
  name: string;
  path: string;
  visible: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  altText: string;
  caption: string;
  category: string;
  date: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  contactNumbers: Array<{ id: string; number: string }>;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface SchoolData {
  schoolName: string;
  schoolLogo: string;
  email: string;
  phone: string;
  address: string;
  navigationItems: NavigationItem[];
  galleryImages: GalleryImage[];
  notices: Notice[];
  welcomeMessage: string;
  contactInfo: ContactInfo;
}

export interface SchoolState {
  data: SchoolData;
  loading: boolean;
}

/* ---------------- DEFAULT DATA ---------------- */

const defaultContactInfo: ContactInfo = {
  address: "Raghavendra Nagar, Turkayamjal, Hyderabad",
  phone: "+91 9876543210",
  email: "info@school.edu",
  contactNumbers: [{ id: "1", number: "+91 9876543210" }],
  location: {
    latitude: 17.272058,
    longitude: 78.588692,
  },
};

export const defaultSchoolData: SchoolData = {
  schoolName: "Preraka Schools",
  schoolLogo: "",
  email: "info@school.edu",
  phone: "+91 9876543210",
  address: "",
  navigationItems: [
    { name: "Home", path: "/", visible: true },
    { name: "About", path: "/about", visible: true },
    { name: "Admissions", path: "/admissions", visible: true },
    { name: "Gallery", path: "/gallery", visible: true },
    { name: "Notice Board", path: "/notice-board", visible: true },
    { name: "Contact", path: "/contact", visible: true },
  ],
  galleryImages: [],
  notices: [],
  welcomeMessage: "Welcome to Preraka Schools",
  contactInfo: defaultContactInfo,
};

const initialState: SchoolState = {
  data: defaultSchoolData,
  loading: true,
};

/* ---------------- ACTIONS ---------------- */

type SchoolAction =
  | { type: "SET_SCHOOL_DATA"; payload: SchoolData }
  | { type: "UPDATE_SCHOOL_DATA"; payload: Partial<SchoolData> }
  | { type: "ADD_NOTICE"; payload: Notice }
  | { type: "DELETE_NOTICE"; payload: string };

/* ---------------- REDUCER ---------------- */

const schoolReducer = (state: SchoolState, action: SchoolAction): SchoolState => {
  switch (action.type) {
    case "SET_SCHOOL_DATA":
      return { ...state, data: action.payload, loading: false };

    case "UPDATE_SCHOOL_DATA":
      const updatedData = { ...state.data, ...action.payload };

      updateSchoolData(action.payload).catch((err) =>
        console.error("Firestore sync failed:", err)
      );

      return { ...state, data: updatedData };

    case "ADD_NOTICE":
      const newNotices = [...state.data.notices, action.payload];

      updateSchoolData({ notices: newNotices }).catch(console.error);

      return {
        ...state,
        data: { ...state.data, notices: newNotices },
      };

    case "DELETE_NOTICE":
      const filteredNotices = state.data.notices.filter(
        (n) => n.id !== action.payload
      );

      updateSchoolData({ notices: filteredNotices }).catch(console.error);

      return {
        ...state,
        data: { ...state.data, notices: filteredNotices },
      };

    default:
      return state;
  }
};

/* ---------------- CONTEXT ---------------- */

const SchoolContext = createContext<{
  state: SchoolState;
  dispatch: React.Dispatch<SchoolAction>;
}>({
  state: initialState,
  dispatch: () => {},
});

/* ---------------- HOOK ---------------- */

export const useSchool = () => {
  return useContext(SchoolContext);
};

/* ---------------- PROVIDER ---------------- */

export const SchoolContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(schoolReducer, initialState);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    console.log("Starting realtime Firestore listener");

    unsubscribeRef.current = subscribeToSchoolData(
      (data) => {
        dispatch({ type: "SET_SCHOOL_DATA", payload: data });

        localStorage.setItem("schoolData", JSON.stringify(data));
      },
      (error) => {
        console.error("Firestore realtime error:", error);

        const cached = localStorage.getItem("schoolData");

        if (cached) {
          dispatch({
            type: "SET_SCHOOL_DATA",
            payload: { ...defaultSchoolData, ...JSON.parse(cached) },
          });
        } else {
          dispatch({ type: "SET_SCHOOL_DATA", payload: defaultSchoolData });
        }
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  if (state.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[999]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <SchoolContext.Provider value={{ state, dispatch }}>
      {children}
    </SchoolContext.Provider>
  );
};
