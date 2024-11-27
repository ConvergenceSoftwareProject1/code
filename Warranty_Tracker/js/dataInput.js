import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

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
const storage = getStorage(app);

// 파일 업로드 함수
async function uploadFiles(file, folder) {
  const storageRef = ref(storage, `${folder}/${file.name}`); // 파일 저장 경로 설정
  await uploadBytes(storageRef, file); // Firebase Storage에 파일 업로드
  const downloadURL = await getDownloadURL(storageRef); // 업로드된 파일의 다운로드 URL 가져오기
  return downloadURL; // 다운로드 URL 반환
}

// DOMContentLoaded 이벤트 리스너
// 페이지 로드 후 헤더 버튼에 클릭 이벤트 추가
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".header-buttons .navigate-button:nth-child(1)").addEventListener("click", () => {
    window.location.href = "mainPage.html"; // Home 버튼: mainPage.html로 이동
  });

  document.querySelector(".header-buttons .navigate-button:nth-child(2)").addEventListener("click", () => {
    window.location.href = "dataInput.html"; // Add 버튼: dataInput.html로 이동
  });

  document.querySelector(".header-buttons .navigate-button:nth-child(3)").addEventListener("click", () => {
    window.location.href = "dataList.html"; // List 버튼: dataList.html로 이동
  });
});

// 제품 정보 저장 폼 제출 이벤트 리스너
document.getElementById('productForm').addEventListener('submit', async function(event) {
  event.preventDefault(); // 기본 폼 제출 동작 막기

  // 오류 메시지 초기화
  document.getElementById('brandError').textContent = '';
  document.getElementById('productNameError').textContent = '';
  document.getElementById('modelNameError').textContent = '';
  document.getElementById('serialNumberError').textContent = '';
  document.getElementById('purchaseDateError').textContent = '';
  document.getElementById('expiryDateError').textContent = '';
  document.getElementById('customNotificationDaysError').textContent = '';

  // 입력값 가져오기
  const brand = document.getElementById('brand').value.trim();
  const productName = document.getElementById('productName').value.trim();
  const modelName = document.getElementById('modelName').value.trim();
  const serialNumber = document.getElementById('serialNumber').value.trim();
  const purchaseDate = document.getElementById('purchaseDate').value;
  const expiryDate = document.getElementById('expiryDate').value;
  const notificationTime = document.getElementById('notificationTime').value;
  const customNotificationDays = document.getElementById('customNotificationDays').value;

  let hasError = false;

  // 입력값 검증
  if (productName === '') {
    document.getElementById('productNameError').textContent = '제품명을 입력하세요.';
    hasError = true;
  }
  if (brand === '') {
    document.getElementById('brandError').textContent = '제조사를 입력하세요.';
    hasError = true;
  }
  if (modelName === '') {
    document.getElementById('modelNameError').textContent = '모델명을 입력하세요.';
    hasError = true;
  }
  if (serialNumber === '') {
    document.getElementById('serialNumberError').textContent = '시리얼 번호를 입력하세요.';
    hasError = true;
  }
  if (purchaseDate === '') {
    document.getElementById('purchaseDateError').textContent = '구매일을 입력하세요.';
    hasError = true;
  }
  if (expiryDate === '') {
    document.getElementById('expiryDateError').textContent = '만료일을 입력하세요.';
    hasError = true;
  }
  if (notificationTime === 'custom' && customNotificationDays === '') {
    document.getElementById('customNotificationDaysError').textContent = '알림 일수를 입력하세요.';
    hasError = true;
  }

  if (!hasError) {
    const receiptFile = document.getElementById('receiptImageInput').files[0];
    const productImageFile = document.getElementById('productImageInput').files[0];

    let receiptImageUrl = '';   
    let productImageUrl = '';

    // 영수증 파일 업로드
    if (receiptFile) {
      receiptImageUrl = await uploadFiles(receiptFile, 'receipt_images');
    }

    // 제품 사진 업로드
    if (productImageFile) {
      productImageUrl = await uploadFiles(productImageFile, 'product_images');
    }

    // Firestore에 제품 정보 저장
    await addDoc(collection(db, "products"), {
      productName: productName,
      brand: brand,
      modelName: modelName,
      serialNumber: serialNumber,
      purchaseDate: purchaseDate,
      expiryDate: expiryDate,
      notificationTime: notificationTime,
      customNotificationDays: customNotificationDays,
      receiptImageUrls: [receiptImageUrl],
      productImageUrl: productImageUrl
    });

    // 폼 초기화 및 알림 표시
    document.getElementById('productForm').reset();
    document.getElementById('productImagePreview').style.display = 'none';
    document.getElementById('receiptImagePreview').style.display = 'none';
    document.getElementById('productImageUploadText').style.display = 'block';
    document.getElementById('receiptImageUploadText').style.display = 'block';

    document.getElementById('customAlert').style.display = 'block';
    setTimeout(() => {
      document.getElementById('customAlert').style.display = 'none';
    }, 3000);
  }
});

// 알림 설정 변경 이벤트 리스너
document.getElementById('notificationTime').addEventListener('change', function() {
  const customContainer = document.getElementById('customNotificationContainer');
  customContainer.style.display = this.value === 'custom' ? 'block' : 'none';
});

// 영수증 이미지 클릭 이벤트 리스너
document.getElementById('receiptImageContainer').addEventListener('click', function() {
  document.getElementById('receiptImageInput').click();
});

// 영수증 이미지 선택 이벤트 리스너
document.getElementById('receiptImageInput').addEventListener('change', function(event) {
  const files = event.target.files;
  if (files.length > 0) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const receiptImagePreview = document.getElementById('receiptImagePreview');
      if (receiptImagePreview) {
        receiptImagePreview.src = e.target.result;
        receiptImagePreview.style.display = 'block';
      }
    };
    reader.readAsDataURL(files[0]);
  }
});

// 제품 이미지 클릭 이벤트 리스너
document.getElementById('productImageContainer').addEventListener('click', function() {
  document.getElementById('productImageInput').click();
});

// 제품 이미지 선택 이벤트 리스너
document.getElementById('productImageInput').addEventListener('change', function(event) {
  const files = event.target.files;
  if (files.length > 0) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const productImagePreview = document.getElementById('productImagePreview');
      if (productImagePreview) {
        productImagePreview.src = e.target.result;
        productImagePreview.style.display = 'block';
      }
    };
    reader.readAsDataURL(files[0]);
  }
});

// 취소 버튼 클릭 이벤트 리스너
document.getElementById("cancelButton").addEventListener("click", function() {
  document.getElementById("productForm").reset();
  document.getElementById("productImagePreview").style.display = "none";
  document.getElementById("receiptImagePreview").style.display = "none";
});