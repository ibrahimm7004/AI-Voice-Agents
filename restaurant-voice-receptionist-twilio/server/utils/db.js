import { admin } from "../firebase.js";

export const dbUtils = {
  parseDBTimestamp: (firestoreTimestamp) => {
    return new Date(
      firestoreTimestamp._seconds * 1000 +
        Math.floor(firestoreTimestamp._nanoseconds / 1000000)
    );
  },

  toDBTimestamp: (timestamp) => {
    return admin.firestore.Timestamp.fromDate(new Date(timestamp));
  },
};
