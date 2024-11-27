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

// 회원가입 기능
function signUp(signUpEmail, signUpPassword) {
  createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword)
    .then((userCredential) => {
      console.log("회원가입 성공", userCredential);
      alert("회원가입이 완료되었습니다.");
    })
    .catch((error) => {
      console.error("회원가입 오류", error);
      alert(`회원가입 실패: ${error.message}`);
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
