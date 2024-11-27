import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBjMwpkT6ErP_kutnyMO025WRzYexE6oSo",
  authDomain: "convergencesoftwareproject1.firebaseapp.com",
  projectId: "convergencesoftwareproject1",
  storageBucket: "convergencesoftwareproject1.appspot.com",
  messagingSenderId: "95772010681",
  appId: "1:95772010681:web:e8c8966e4d388486449368",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 수정된 showToast 함수
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  // 토스트 메시지를 화면에 추가
  document.body.appendChild(toast);

  // 일정 시간 후에 표시
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  // 일정 시간 후에 메시지를 숨기고 제거
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 500); // 제거까지 대기
  }, 3000);
}

// 남은 일수를 계산하는 함수
function calculateDaysLeft(expiryDate) {
  const today = new Date();
  const timeDiff = expiryDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

// 만료 알림 확인 함수
async function checkExpiryNotifications() {
    const today = new Date();
    const productsSnapshot = await getDocs(collection(db, "products"));
  
    for (const doc of productsSnapshot.docs) {
      const data = doc.data();
      const expiryDate = new Date(data.expiryDate);
      const notificationTime = data.notificationTime;
      let notificationStartDate;
  
      // 알림 시작 날짜 계산
      if (notificationTime === "1week") {
        notificationStartDate = new Date(expiryDate);
        notificationStartDate.setDate(expiryDate.getDate() - 7);
      } else if (notificationTime === "1month") {
        notificationStartDate = new Date(expiryDate);
        notificationStartDate.setMonth(expiryDate.getMonth() - 1);
      } else if (notificationTime === "1day") {
        notificationStartDate = new Date(expiryDate);
        notificationStartDate.setDate(expiryDate.getDate() - 1);
      } else if (notificationTime === "custom") {
        const daysBefore = parseInt(data.customNotificationDays, 10);
        notificationStartDate = new Date(expiryDate);
        notificationStartDate.setDate(expiryDate.getDate() - daysBefore);
      }
  
      const daysLeft = calculateDaysLeft(expiryDate);
  
      // 알림 조건: 오늘 날짜가 알림 시작 날짜와 만료일 사이인지 확인
      if (
        notificationStartDate &&
        today >= notificationStartDate &&
        today <= expiryDate
      ) {
        showToast(`${data.productName} 보증 만료일이 ${daysLeft}일 남았습니다!`);
        await new Promise((resolve) => setTimeout(resolve, 3500)); // 다음 메시지 대기
      }
    }
  }
  

// DOMContentLoaded 이벤트에서 알림 확인 실행
document.addEventListener("DOMContentLoaded", checkExpiryNotifications);
