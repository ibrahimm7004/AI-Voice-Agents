import { getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";

const serviceAccount = await import(
  "./banded-arch-441723-g6-firebase-adminsdk-1o8y0-e7b99afb11.json",
  {
    assert: { type: "json" },
  }
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount.default),
});

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

export { admin, db };
