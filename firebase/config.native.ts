import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore Firebase's browser declarations omit the native persistence export.
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { app } from "./app";

function nativeAuth() {
  try {
    // Persist native sessions across app restarts.
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch (error) {
    // Reuse auth after a development reload.
    if (typeof error === "object" && error !== null &&
        "code" in error && error.code === "auth/already-initialized") {
      return getAuth(app);
    }
    throw error;
  }
}

const auth = nativeAuth();
const db = getFirestore(app);
export { app, auth, db };
