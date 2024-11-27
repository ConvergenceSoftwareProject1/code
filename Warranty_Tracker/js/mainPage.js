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

// 버튼 이벤트 추가
document.getElementById("homeButton").addEventListener("click", () => {
  window.location.reload();
});
document.getElementById("addButton").addEventListener("click", () => {
  window.location.href = "dataInput.html";
});
document.getElementById("listButton").addEventListener("click", () => {
  window.location.href = "dataList.html";
});

// 현재 날짜와 시간을 업데이트하는 함수
function updateDateTime() {
  const now = new Date();

  const options = { year: "numeric", month: "long", day: "numeric", weekday: "long" };
  document.getElementById("date").textContent = now.toLocaleDateString("ko-KR", options);

  const timeString = now.toLocaleTimeString("ko-KR", { hour12: false });
  document.getElementById("time").textContent = timeString;
}

// 1초마다 시계 업데이트
setInterval(updateDateTime, 1000);
updateDateTime();

// Firestore에서 제품 알림 데이터 가져오기
async function checkNotifications() {
  const querySnapshot = await getDocs(collection(db, "products"));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log("Firestore 데이터 로드:", querySnapshot.docs.map((doc) => doc.data()));

  const notifications = [];

  querySnapshot.forEach((doc) => {
    const product = doc.data();
    const expiryDate = new Date(product.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);

    let notificationDate = new Date(expiryDate);
    const notificationTime = product.notificationTime;
    const customNotificationDays = parseInt(product.customNotificationDays || 0, 10);

    // 알림 설정에 따라 알림 날짜 계산
    if (notificationTime === "1day") {
      notificationDate.setDate(expiryDate.getDate() - 1);
    } else if (notificationTime === "1week") {
      notificationDate.setDate(expiryDate.getDate() - 7);
    } else if (notificationTime === "1month") {
      notificationDate.setDate(expiryDate.getDate() - 30);
    } else if (notificationTime === "custom" && customNotificationDays > 0) {
      notificationDate.setDate(expiryDate.getDate() - customNotificationDays);
    } else {
      return; // 알림이 설정되지 않은 경우
    }

    console.log("Product:", product.productName, "Notification Date:", notificationDate, "Today:", today);

    if (today.getTime() === notificationDate.getTime()) {
      notifications.push(`${product.productName}의 보증 기간이 ${expiryDate.toLocaleDateString("ko-KR")}에 만료됩니다.`);
    }
  });

  console.log("알림 생성됨:", notifications);

  if (notifications.length === 0) {
    console.log("오늘 알림이 없습니다.");
    return;
  }

  notifications.forEach((message) => {
    showToast(message);
  });
}

function showToast(message) {
  const toastContainer = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  toastContainer.appendChild(toast);
  console.log("토스트 표시:", message);

  setTimeout(() => {
    toast.remove();
    console.log("토스트 제거:", message);
  }, 5000);
}

// 달력 초기화
document.addEventListener("DOMContentLoaded", async function () {
  const calendarEl = document.getElementById("calendar");
  const events = await fetchProductExpiryEvents();

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "ko",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,dayGridWeek,dayGridDay",
    },
    events: events,
  });

  calendar.render();
});

// Firestore에서 제품 리스트와 만료일 가져오기
async function fetchProductExpiryEvents() {
  const querySnapshot = await getDocs(collection(db, "products"));
  const events = [];

  querySnapshot.forEach((doc) => {
    const product = doc.data();
    if (product.expiryDate) {
      events.push({
        title: `${product.productName} 만료일`,
        start: product.expiryDate,
        backgroundColor: "#58404E",
        borderColor: "#58404E",
        textColor: "white",
      });
    }
  });

  return events;
}

// 제품 리스트 로드
async function loadProductList() {
  const productList = document.getElementById("productList");
  const querySnapshot = await getDocs(collection(db, "products"));

  productList.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const product = doc.data();
    const listItem = document.createElement("li");
    listItem.textContent = `${product.productName} (${product.expiryDate})`;
    productList.appendChild(listItem);
  });

  if (querySnapshot.empty) {
    productList.innerHTML = "<li>등록된 제품이 없습니다.</li>";
  }
}

// 초기 실행
document.addEventListener("DOMContentLoaded", () => {
  loadProductList();
  checkNotifications();
});