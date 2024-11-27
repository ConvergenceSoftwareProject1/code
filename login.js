import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCU67m-QgC0LHroEJRKfcBlkFi-gAAGUlc",
  authDomain: "test-fd877.firebaseapp.com",
  projectId: "test-fd877",
  storageBucket: "test-fd877.appspot.com",
  messagingSenderId: "656570848247",
  appId: "1:656570848247:web:d0b3c7ad793ddad01394f2",
  measurementId: "G-4Q83YBKVR5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

// 로그인 기능
function signIn(signInEmail, signInPassword) {
  signInWithEmailAndPassword(auth, signInEmail, signInPassword)
    .then((userCredential) => {
      console.log("로그인 성공", userCredential);
      alert("로그인 성공");
    })
    .catch((error) => {
      console.error("로그인 오류", error);
      alert(`로그인 실패: ${error.message}`);
    });
}

// 폼 전환 기능
function toggleForm(formType) {
  if (formType === 'login') {
    console.log("로그인 폼으로 전환");
  } else {
    console.log("회원가입 폼으로 전환");
  }
} 
