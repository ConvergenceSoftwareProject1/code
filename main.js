import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import { showToast, checkNotifications, scheduleNotification } from './toast_message.js';

const firebaseConfig = {
  apiKey: "AIzaSyBjMwpkT6ErP_kutnyMO025WRzYexE6oSo",
  authDomain: "convergencesoftwareproject1.firebaseapp.com",
  databaseURL: "https://convergencesoftwareproject1-default-rtdb.firebaseio.com",
  projectId: "convergencesoftwareproject1",
  storageBucket: "convergencesoftwareproject1.appspot.com",
  messagingSenderId: "95772010681",
  appId: "1:95772010681:web:e8c8966e4d388486449368",
  measurementId: "G-WMXWPPVBGW"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', () => {
  checkNotifications();  // 알림 확인
});

// 파일을 Firebase Storage에 업로드하고 URL을 반환하는 함수
async function uploadFiles(file, folder) {
  const storageRef = ref(storage, `${folder}/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// 알림 설정 변경 시 사용자 지정 입력 필드 표시
document.getElementById('notificationTime').addEventListener('change', function () {
  const customContainer = document.getElementById('customNotificationContainer');
  customContainer.style.display = this.value === 'custom' ? 'block' : 'none';
});

// 폼 제출 처리
document.getElementById('productForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  // 기존 에러 메시지 초기화
  const errorFields = [
    'productNameError',
    'brandError',
    'modelNameError',
    'serialNumberError',
    'purchaseDateError',
    'expiryDateError',
    'customNotificationDaysError',
  ];
  errorFields.forEach((id) => (document.getElementById(id).textContent = ''));

  // 입력값 가져오기
  const productName = document.getElementById('productName').value.trim();
  const brand = document.getElementById('brand').value.trim();
  const modelName = document.getElementById('modelName').value.trim();
  const serialNumber = document.getElementById('serialNumber').value.trim();
  const purchaseDate = document.getElementById('purchaseDate').value;
  const expiryDate = document.getElementById('expiryDate').value;
  const notificationTime = document.getElementById('notificationTime').value;
  const customNotificationDays = document.getElementById('customNotificationDays').value;

  // 유효성 검사
  let hasError = false;
  if (!productName) {
    document.getElementById('productNameError').textContent = '제품명을 입력하세요.';
    hasError = true;
  }
  if (!brand) {
    document.getElementById('brandError').textContent = '제조사를 입력하세요.';
    hasError = true;
  }
  if (!modelName) {
    document.getElementById('modelNameError').textContent = '모델명을 입력하세요.';
    hasError = true;
  }
  if (!serialNumber) {
    document.getElementById('serialNumberError').textContent = '시리얼 번호를 입력하세요.';
    hasError = true;
  }
  if (!purchaseDate) {
    document.getElementById('purchaseDateError').textContent = '구매일을 입력하세요.';
    hasError = true;
  }
  if (!expiryDate) {
    document.getElementById('expiryDateError').textContent = '만료일을 입력하세요.';
    hasError = true;
  }
  if (notificationTime === 'custom' && !customNotificationDays) {
    document.getElementById('customNotificationDaysError').textContent = '알림 일수를 입력하세요.';
    hasError = true;
  }

  if (hasError) return;

  // 알림 예약
  if (expiryDate && notificationTime !== 'none') {
    scheduleNotification(expiryDate, notificationTime, customNotificationDays, productName);
  }

  // 파일 가져오기 및 업로드
  const receiptFile = document.getElementById('receiptImageInput').files[0];
  const productFile = document.getElementById('productImageInput').files[0];
  let receiptImageUrl = '';
  let productImageUrl = '';

  if (receiptFile) receiptImageUrl = await uploadFiles(receiptFile, 'receipt_images');
  if (productFile) productImageUrl = await uploadFiles(productFile, 'product_images');

  // Firestore에 데이터 저장
  await addDoc(collection(db, 'products'), {
    productName,
    brand,
    modelName,
    serialNumber,
    purchaseDate,
    expiryDate,
    notificationTime,
    customNotificationDays,
    receiptImageUrls: [receiptImageUrl],
    productImageUrl,
  });

  // 저장 완료 알림
  showToast('제품 정보가 성공적으로 저장되었습니다.');

  // 폼 초기화
  document.getElementById('productForm').reset();
  document.getElementById('productImagePreview').style.display = 'none';
  document.getElementById('receiptImagePreview').style.display = 'none';
});

// 이미지 업로드 시 미리보기
document.getElementById('receiptImageContainer').addEventListener('click', () => {
  document.getElementById('receiptImageInput').click();
});

document.getElementById('receiptImageInput').addEventListener('change', (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const receiptImagePreview = document.getElementById('receiptImagePreview');
      receiptImagePreview.src = e.target.result;
      receiptImagePreview.style.display = 'block';
    };
    reader.readAsDataURL(files[0]);
  }
});

document.getElementById('productImageContainer').addEventListener('click', () => {
  document.getElementById('productImageInput').click();
});

document.getElementById('productImageInput').addEventListener('change', (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const productImagePreview = document.getElementById('productImagePreview');
      productImagePreview.src = e.target.result;
      productImagePreview.style.display = 'block';
    };
    reader.readAsDataURL(files[0]);
  }
});

// 취소 버튼 클릭 시 초기화
document.getElementById('cancelButton').addEventListener('click', () => {
  document.getElementById('productForm').reset();
  document.getElementById('productImagePreview').style.display = 'none';
  document.getElementById('receiptImagePreview').style.display = 'none';
});
