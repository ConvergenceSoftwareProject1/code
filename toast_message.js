// 토스트 메시지 생성 함수
export function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.backgroundColor = '#333';
  toast.style.color = '#fff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '5px';
  toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  toast.style.zIndex = '10000';
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5000); // 5초 후에 메시지 제거
}

// 알림 확인 및 실행 함수
export function checkNotifications() {
  const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
  const now = Date.now();
  const updatedNotifications = notifications.filter(notification => {
    if (notification.timestamp <= now) {
      showToast(notification.message);
      return false; // 이미 표시된 알림은 제거
    }
    return true;
  });

  localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
}

// 알림 예약 함수 (1시간마다 반복)
export function scheduleNotification(expiryDate, notificationTime, customDays, productName) {
  const expiryTimestamp = new Date(expiryDate).getTime();
  let notificationTimestamp;

  if (notificationTime === '1month') {
    notificationTimestamp = expiryTimestamp - 30 * 24 * 60 * 60 * 1000; // 1달 전
  } else if (notificationTime === '1week') {
    notificationTimestamp = expiryTimestamp - 7 * 24 * 60 * 60 * 1000; // 1주일 전
  } else if (notificationTime === '1day') {
    notificationTimestamp = expiryTimestamp - 1 * 24 * 60 * 60 * 1000; // 1일 전
  } else if (notificationTime === 'custom' && customDays) {
    notificationTimestamp = expiryTimestamp - customDays * 24 * 60 * 60 * 1000; // 사용자 지정
  }

  if (notificationTimestamp && notificationTimestamp > Date.now()) {
    const notificationData = {
      productName: productName,
      message: `제품 '${productName}'의 보증이 만료됩니다!`,
      timestamp: notificationTimestamp,
    };

    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.push(notificationData);
    localStorage.setItem('notifications', JSON.stringify(notifications));

    // 알림이 시작된 시점부터 마감일까지 1시간마다 반복적으로 메시지 표시
    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now >= expiryTimestamp) {
        clearInterval(intervalId);  // 만약 만료일을 지났다면 반복 중지
      } else {
        showToast(`제품 '${productName}'의 보증이 만료됩니다!`);
      }
    }, 60 * 60 * 1000);  // 1시간마다 반복
  }
}
