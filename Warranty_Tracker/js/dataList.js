import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Firebase 설정
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
const db = getFirestore(app);

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

// 제품 데이터와 필터링된 데이터 배열 초기화
let products = [];
let filteredProducts = [];

// Firestore에서 제품 데이터를 로드하는 비동기 함수
async function loadProducts() {
  const productListDiv = document.getElementById('productList');
  const querySnapshot = await getDocs(collection(db, "products"));

  // Firestore에서 각 문서를 가져와 배열에 저장
  querySnapshot.forEach((doc) => {
    const product = doc.data();
    products.push({
      id: doc.id,
      data: {
        productName: product.productName,
        modelName: product.modelName || "",
        serialNumber: product.serialNumber || "",
        brand: product.brand || "",
        expiryDate: product.expiryDate,
        productImageUrl: product.productImageUrl || ""
      }
    });
  });

  // 필터링 배열 초기화 및 화면에 표시
  filteredProducts = [...products];
  displayProducts(filteredProducts);
}

// 제품 데이터를 화면에 표시하는 함수
function displayProducts(filteredProducts) {
  const productListDiv = document.getElementById('productList');
  productListDiv.innerHTML = '';

  // 카운트 초기화
  let totalCount = 0;
  let inWarrantyCount = 0;
  let expiredCount = 0;

  // 필터링된 제품 배열을 반복 처리
  filteredProducts.forEach((productObj) => {
    const product = productObj.data;
    const currentDate = new Date();
    const expiryDate = new Date(product.expiryDate);
    currentDate.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    // 보증 상태에 따라 카운트 증가
    if (currentDate <= expiryDate) {
      inWarrantyCount++;
    } else {
      expiredCount++;
    }
    totalCount++;

    // 제품 항목 생성
    const productItem = document.createElement('div');
    productItem.className = 'product-item';

    // 보증 상태 라벨 설정
    let warrantyStatus = '';
    if (currentDate <= expiryDate) {
      warrantyStatus = '<span class="warranty-status in-warranty">In warranty</span>';
    } else {
      warrantyStatus = '<span class="warranty-status">무상 보증 기간 만료</span>';
    }

    // 제품 항목의 HTML 구조
    productItem.innerHTML = `
      <img src="${product.productImageUrl}" alt="${product.productName}" onerror="this.style.display='none';">
      <div class="product-info">
        <div class="product-name">${product.productName}</div>
        <div class="expiry-date">만료일: ${product.expiryDate}</div>
      </div>
      ${warrantyStatus}
    `;

    // 제품 항목 클릭 시 상세 페이지로 이동
    productItem.onclick = () => {
      localStorage.setItem('selectedProduct', JSON.stringify({ id: productObj.id, data: product }));
      window.location.href = 'dataShow.html';
    };

    productListDiv.appendChild(productItem);
  });

  // 카운트 정보를 DOM에 업데이트
  document.getElementById('totalCount').textContent = `전체 항목 개수: ${totalCount}`;
  document.getElementById('inWarrantyCount').textContent = `In warranty 개수: ${inWarrantyCount}`;
  document.getElementById('expiredCount').textContent = `보증 기간 만료 개수: ${expiredCount}`;
}

// 검색어로 제품 목록을 필터링하는 함수
function filterProducts() {
  const searchQuery = document.getElementById('searchBar').value.toLowerCase();
  filteredProducts = products.filter(product => {
    return (
      (product.data.productName?.toLowerCase() || "").includes(searchQuery) ||
      (product.data.modelName?.toLowerCase() || "").includes(searchQuery) ||
      (product.data.serialNumber?.toLowerCase() || "").includes(searchQuery) ||
      (product.data.brand?.toLowerCase() || "").includes(searchQuery)
    );
  });
  displayProducts(filteredProducts);
}

// 보증 상태별로 제품 목록을 필터링하는 함수
function filterByStatus(status) {
  const currentDate = new Date();
  if (status === 'inWarranty') {
    filteredProducts = products.filter(product => {
      const expiryDate = new Date(product.data.expiryDate);
      currentDate.setHours(0, 0, 0, 0);
      expiryDate.setHours(0, 0, 0, 0);
      return currentDate <= expiryDate;
    });
  } else if (status === 'expired') {
    filteredProducts = products.filter(product => {
      const expiryDate = new Date(product.data.expiryDate);
      currentDate.setHours(0, 0, 0, 0);
      expiryDate.setHours(0, 0, 0, 0);
      return currentDate > expiryDate;
    });
  } else {
    filteredProducts = [...products];
  }
  displayProducts(filteredProducts);
}

// DOM 로드 후 이벤트 리스너 등록 및 데이터 로드
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchBar').addEventListener('input', filterProducts);
  loadProducts();

  document.getElementById('totalCount').addEventListener('click', () => filterByStatus('all'));
  document.getElementById('inWarrantyCount').addEventListener('click', () => filterByStatus('inWarranty'));
  document.getElementById('expiredCount').addEventListener('click', () => filterByStatus('expired'));
});