const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const snapshot = await db.collection("vocab_status").get();
const statusMap = {};

snapshot.forEach(doc => {
    statusMap[doc.id] = doc.data().checked;
});