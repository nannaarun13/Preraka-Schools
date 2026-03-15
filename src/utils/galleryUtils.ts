
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

export const subscribeToGallery = (callback) => {

  const galleryRef = collection(db, "gallery")

  return onSnapshot(galleryRef, (snapshot) => {

    const images = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    callback(images)

  })

}
```
