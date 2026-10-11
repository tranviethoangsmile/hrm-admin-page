import Swal from "sweetalert2";

const showConfirm = (options = {}) => {
  const {
    title = "Xác nhận",
    text = "Bạn có chắc chắn muốn thực hiện thao tác này?",
    confirmButtonText = "Đồng ý",
    cancelButtonText = "Hủy",
    showCancelButton = true,
  } = options;

  return Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText,
    cancelButtonText,
    customClass: {
      popup: "rounded-4",
    },
    ...options,
  });
};

export const showToast = (options = {}) => {
  const {
    icon = "success",
    title = "",
    timer = 2500,
  } = options;

  return Swal.fire({
    icon,
    title,
    timer,
    timerProgressBar: true,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    background: "#fff",
    customClass: {
      popup: "rounded-4",
    },
    ...options,
  });
};

export default showConfirm;