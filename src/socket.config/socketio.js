import io from "socket.io-client";
import { SOCKET_URL } from "../constants";
const socket = io(SOCKET_URL);
socket.on("connect", () => {
  console.log("Connected to server");
  // Gửi và nhận các thông điệp từ máy chủ
  socket.on("disconnect", () => {
    console.log("Disconnected from server");
  });
});
export default socket;
