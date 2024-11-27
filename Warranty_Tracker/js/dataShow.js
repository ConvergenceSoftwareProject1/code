import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, doc, updateDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

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

const selectedProduct = JSON.parse(localStorage.getItem("selectedProduct"));

if (selectedProduct) {
  const productId = selectedProduct.id;

  async function loadProductData() {
    const productRef = doc(db, "products", productId);
    const docSnap = await getDoc(productRef);

    if (docSnap.exists()) {
      const product = docSnap.data();

      document.getElementById("productImage").src =
        product.productImageUrl || "default-image.jpg";
      document.getElementById("productName").textContent =
        product.productName;
      document.getElementById("modelName").textContent =
        product.modelName;
      document.getElementById("serialNumber").textContent =
        product.serialNumber;
      document.getElementById("purchaseDate").textContent =
        product.purchaseDate;
      document.getElementById("expiryDate").textContent =
        product.expiryDate;
      document.getElementById("brand").textContent = product.brand;

      const receiptLink = document.getElementById("receiptLink");
      if (product.receiptImageUrls && product.receiptImageUrls.length > 0) {
        receiptLink.href = product.receiptImageUrls[0];
        receiptLink.textContent = "보기";
      } else {
        document.getElementById("receiptImage").textContent = "없음";
      }

      initializeCalendar(product);
    } else {
      console.log("No such document!");
    }
  }

  loadProductData();

  function initializeCalendar(product) {
    const calendarEl = document.getElementById("calendar");
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      locale: "ko",
      initialDate: product.expiryDate || new Date().toISOString().split("T")[0], // 만료일 기준으로 렌더링
      headerToolbar: {
        left: "prev,next today goToPurchaseDate goToExpiryDate",
        center: "title",
        right: "dayGridMonth,dayGridWeek,dayGridDay",
      },
      customButtons: {
        goToPurchaseDate: {
          text: "구매일",
          click: () => {
            if (product.purchaseDate) {
              calendar.gotoDate(product.purchaseDate);
              setActiveCustomButton("goToPurchaseDate");
            }
          },
        },
        goToExpiryDate: {
          text: "만료일",
          click: () => {
            if (product.expiryDate) {
              calendar.gotoDate(product.expiryDate);
              setActiveCustomButton("goToExpiryDate");
            }
          },
        },
      },
      events: [
        {
          title: "구매일",
          start: product.purchaseDate,
          backgroundColor: "#762052",
          borderColor: "#762052",
          textColor: "white",
        },
        {
          title: "만료일",
          start: product.expiryDate,
          backgroundColor: "#58404E",
          borderColor: "#58404E",
          textColor: "white",
        },
      ],
    });

    calendar.render();

    // today 버튼 클릭 시 커스텀 버튼 초기화
    document.querySelector(".fc-today-button").addEventListener("click", () => {
      resetCustomButtons();
    });

    // 특정 customButton 활성화 및 이전 상태 초기화
    function setActiveCustomButton(buttonId) {
      resetCustomButtons();

      const currentButton = document.querySelector(`.fc-${buttonId}-button`);
      currentButton.classList.add("fc-button-active");
      currentButton.style.backgroundColor = "#84587175"; // 활성화된 상태 색상
      currentButton.style.color = "white"; // 텍스트 색상 유지
    }

    // 모든 customButton 초기화
    function resetCustomButtons() {
      const buttons = ["goToPurchaseDate", "goToExpiryDate"];
      buttons.forEach((buttonId) => {
        const button = document.querySelector(`.fc-${buttonId}-button`);
        if (button) {
          button.classList.remove("fc-button-active");
          button.style.backgroundColor = "#58404E"; // 기본 배경색
          button.style.color = "white"; // 기본 텍스트 색상
        }
      });
    }
  }

  const editButton = document.getElementById("editButton");
  editButton.addEventListener("click", function () {
    const isEditing = editButton.textContent === "저장";

    if (isEditing) {
      const updatedProduct = {
        productName: document.getElementById("editProductName").value,
        modelName: document.getElementById("editModelName").value,
        serialNumber: document.getElementById("editSerialNumber").value,
        purchaseDate: document.getElementById("editPurchaseDate").value,
        expiryDate: document.getElementById("editExpiryDate").value,
        brand: document.getElementById("editBrand").value,
      };

      const productRef = doc(db, "products", productId);
      updateDoc(productRef, updatedProduct)
        .then(() => {
          location.reload();
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    } else {
      document.getElementById(
        "productName"
      ).innerHTML = `<input type="text" id="editProductName" value="${document.getElementById("productName").textContent}">`;
      document.getElementById(
        "modelName"
      ).innerHTML = `<input type="text" id="editModelName" value="${document.getElementById("modelName").textContent}">`;
      document.getElementById(
        "serialNumber"
      ).innerHTML = `<input type="text" id="editSerialNumber" value="${document.getElementById("serialNumber").textContent}">`;
      document.getElementById(
        "purchaseDate"
      ).innerHTML = `<input type="date" id="editPurchaseDate" value="${document.getElementById("purchaseDate").textContent}">`;
      document.getElementById(
        "expiryDate"
      ).innerHTML = `<input type="date" id="editExpiryDate" value="${document.getElementById("expiryDate").textContent}">`;
      document.getElementById(
        "brand"
      ).innerHTML = `<input type="text" id="editBrand" value="${document.getElementById("brand").textContent}">`;

      editButton.textContent = "저장";
    }
  });

  const uploadButton = document.getElementById("uploadButton");
  const fileInput = document.getElementById("fileInput");

  uploadButton.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
      const productRef = doc(db, "products", productId);
      const productDoc = await getDoc(productRef);
      if (productDoc.exists()) {
        const existingProduct = productDoc.data();
        if (
          existingProduct.receiptImageUrls &&
          existingProduct.receiptImageUrls.length > 0
        ) {
          const oldImageUrl = existingProduct.receiptImageUrls[0];
          const oldImageRef = ref(storage, oldImageUrl);
          try {
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error("이전 이미지 삭제 중 오류 발생: ", error);
          }
        }
      }

      const storageRef = ref(storage, `receipt_images/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      await updateDoc(productRef, {
        receiptImageUrls: [fileUrl],
      });

      const receiptLink = document.getElementById("receiptLink");
      receiptLink.href = fileUrl;
      receiptLink.textContent = "보기";
    }
  });

  const deleteButton = document.getElementById("deleteButton");
  deleteButton.addEventListener("click", async function () {
    const confirmDelete = confirm("이 제품을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const productRef = doc(db, "products", productId);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        const productData = productDoc.data();

        if (productData.productImageUrl) {
          const imageRef = ref(storage, productData.productImageUrl);

          try {
            await deleteObject(imageRef);
            console.log("제품 이미지 삭제 완료");
          } catch (error) {
            console.warn("이미지 삭제 중 오류 발생:", error);
          }
        }

        if (productData.receiptImageUrls && productData.receiptImageUrls.length > 0) {
          for (const receiptUrl of productData.receiptImageUrls) {
            const receiptRef = ref(storage, receiptUrl);

            try {
              await deleteObject(receiptRef);
              console.log(`첨부 파일 삭제 완료: ${receiptUrl}`);
            } catch (error) {
              console.warn(`첨부 파일 삭제 중 오류 발생 (${receiptUrl}):`, error);
            }
          }
        }

        try {
          await deleteDoc(productRef);
          alert("제품이 성공적으로 삭제되었습니다.");
          window.location.href = "dataList.html";
        } catch (error) {
          console.error("Firestore 문서 삭제 중 오류 발생:", error);
          alert("제품 문서 삭제 중 오류가 발생했습니다.");
        }
      } else {
        console.warn("삭제할 제품 정보를 찾을 수 없습니다.");
        alert("삭제할 제품 정보를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("삭제 중 알 수 없는 오류 발생:", error);
      alert("제품 삭제 중 오류가 발생했습니다.");
    }
  });
} else {
  document.querySelector(".container").innerHTML =
    "<p>제품 정보를 불러올 수 없습니다.</p>";
}