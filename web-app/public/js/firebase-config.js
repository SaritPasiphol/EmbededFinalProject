import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLQ1r0RhcOf2jbQuytlpfEyXR1DjdIG5M",
  authDomain: "embedded-final-project-e8732.firebaseapp.com",
  databaseURL:
    "https://embedded-final-project-e8732-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "embedded-final-project-e8732",
  storageBucket: "embedded-final-project-e8732.appspot.com",
  messagingSenderId: "322575326586",
  appId: "1:322575326586:web:7d7a01a35ef4ab51214ac3",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
