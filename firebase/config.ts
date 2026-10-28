import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { app } from "./app";

// Use Firebase's browser persistence defaults.
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
