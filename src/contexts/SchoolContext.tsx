import React, { createContext, useContext, useReducer, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { Unsubscribe } from "firebase/firestore";

// FIXED: use relative import instead of @ alias
import { subscribeToSchoolData, updateSchoolData } from "../utils/schoolDataUtils";

/* ---------------------------------------------------
   TYPES
--------------------------------------------------- */

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

export interface AdmissionInquiry {
  id: string;
  studentName: string;
  classApplied: string;
  previousClass: string;
  presentClass: string;
  previousSchool: string;
  fatherName: string;
  motherName: string;
  primaryContact: string;
  secondaryContact: string;
  location: string;
  additionalInfo: string;
  submittedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  sentAt: string;
}

export interface LatestUpdate {
  id: string;
  content: string;
  date: string;
}

export interface Founder {
  id: string;
  name: string;
  details: string;
  image: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  contactNumbers: Array<{ id: string; number: string }>;
  mapEmbed?: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface SchoolData {
  schoolName: string;
  schoolLogo: string;
  schoolNameImage: string;
  email: string;
  phone: string;
  address: string;
  navigationItems: NavigationItem[];
  galleryImages: GalleryImage[];
  notices: Notice[];
  welcomeMessage: string;
  welcomeImage: string;
  aboutUsText: string;
  aboutContent: string;
  missionStatement: string;
  visionStatement: string;
  contactDetails: {
    address: string;
    phone: string;
    email: string;
  };
  contactInfo: ContactInfo;
  latestUpdates: LatestUpdate[];
  founders: Founder[];
  schoolHistory: string;
  founderDetails: string;
}

export interface SchoolState {
  data: SchoolData;
  admissionInquiries: AdmissionInquiry[];
  contactMessages: ContactMessage[];
  siteVisitors: number;
  loading: boolean;
}

/* ---------------------------------------------------
   DEFAULT DATA
--------------------------------------------------- */

const defaultContactInfo: ContactInfo = {
  address: "Raghavendra Nagar, Turkayamjal, Hyderabad",
  phone: "+91 9876543210",
  email: "info@school.edu",
  contactNumbers: [
    { id: "1", number: "+91 9876543210" },
    { id: "2", number: "+91 9876543210" },
  ],
  location: {
    latitude: 17.272058,
    longitude: 78.588692,
  },
};

export const defaultSchoolData: SchoolData = {
  schoolName: "Preraka Schools",
  schoolLogo: "",
  schoolNameImage: "",
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
  welcomeImage: "",
  aboutUsText: "",
  aboutContent: "",
  missionStatement: "",
  visionStatement: "",
  contactDetails: {
    address: "",
    phone: "",
    email: "",
  },
  contactInfo: defaultContactInfo,
  latestUpdates: [],
  founders: [],
  schoolHistory: "",
  founderDetails: "",
};

const initialState: SchoolState = {
  data: defaultSchoolData,
  admissionInquiries: [],
  contactMessages: [],
  siteVisitors: 0,
  loading: true,
};

/* ---------------------------------------------------
   ACTION TYPES
--------------------------------------------------- */

type SchoolAction =
  | { type: "SET_SCHOOL_DATA"; payload: SchoolData }
  | { type: "UPDATE_SCHOOL_DATA"; payload: Partial<SchoolData> }
  | { type: "ADD_NOTICE"; payload: Notice }
  | { type: "DELETE_NOTICE"; payload: string };

/* ---------------------------------------------------
   REDUCER
--------------------------------------------------- */

const schoolReducer = (state: SchoolState, action: SchoolAction): SchoolState => {
  switch (action.type) {
    case "SET_SCHOOL_DATA":
      return { ...state, data: action.payload, loading: false };

    case "UPDATE_SCHOOL_DATA":
      const updated = { ...state.data, ...action.payload };

      updateSchoolData(action.payload).catch((err) =>
        console.error("Database sync failed:", err)
      );

      return { ...state, data: updated };

    case "ADD_NOTICE":
      const notices = [...state.data.notices, action.payload];

      updateSchoolData({ notices }).catch(console.error);

      return { ...state, data: { ...state.data, notices } };

    case "DELETE_NOTICE":
      const filtered = state.data.notices.filter((n) => n.id !== action.payload);

      updateSchoolData({ notices: filtered }).catch(console.error);

      return { ...state, data: { ...state.data, notices: filtered } };

    default:
      return state;
  }
};

/* ---------------------------------------------------
   CONTEXT
--------------------------------------------------- */

const SchoolContext = createContext<{
  state: SchoolState;
  dispatch: React.Dispatch<SchoolAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const useSchool = () => {
  const context = useContext(SchoolContext);

  if (!context) {
    throw new Error("useSchool must be used inside SchoolContextProvider");
  }

  return context;
};

/* ---------------------------------------------------
   PROVIDER
--------------------------------------------------- */

export const SchoolContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(schoolReducer, initialState);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    console.log("Starting realtime listener...");

    unsubscribeRef.current = subscribeToSchoolData(
      (data) => {
        dispatch({ type: "SET_SCHOOL_DATA", payload: data });

        if (typeof window !== "undefined") {
          localStorage.setItem("schoolData", JSON.stringify(data));
        }
      },
      (error) => {
        console.error("Realtime error:", error);

        if (typeof window !== "undefined") {
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
