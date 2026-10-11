import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilImage,
  cilPaperPlane,
  cilSearch,
  cilTrash,
} from "@coreui/icons";
import { useTranslation } from "react-i18next";
import moment from "moment";
import CryptoJS from "crypto-js";
import socket from "../../socket.config/socketio";
import { adminRequest, getCurrentUser } from "../../api/adminClient";
import {
  CONVERSATION,
  CREATE,
  DELETE,
  GET_GROUP_MEMBER_OF_USER,
  GROUP_MEMBER,
  MESSAGE,
  SEARCH_MESSAGE_WITH_CONVERSATION,
  USER_URL,
} from "../../constants";

const encryptMessage = (text, key) => {
  if (!text || !key) return text;
  return CryptoJS.AES.encrypt(text, key).toString();
};

const decryptMessage = (cipher, key) => {
  if (!cipher || !key) return cipher;
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, key);
    const text = bytes.toString(CryptoJS.enc.Utf8);
    return text || cipher;
  } catch {
    return cipher;
  }
};

const guessMessageType = (fileName = "") => {
  const name = fileName.toLowerCase();
  if (name.match(/\.(jpe?g|png|gif|webp|bmp)$/)) return "IMAGE";
  if (name.match(/\.(mp4|mov|avi|webm|mkv)$/)) return "VIDEO";
  return "DOCUMENT";
};

const ChatCenter = () => {
  const { t } = useTranslation();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const messagesEndRef = useRef(null);

  const [loadingList, setLoadingList] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [text, setText] = useState("");
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [users, setUsers] = useState([]);
  const [sending, setSending] = useState(false);

  const conversationName = useCallback(
    (item) => {
      if (!item) return t("chat.empty");
      if (item.group_type === "GROUP")
        return item.conversation?.title || t("chat.group");
      return item.users?.name || t("chat.peer");
    },
    [t]
  );

  const lastMessagePreview = useCallback((item) => {
    const msgs = item.conversation?.messages || [];
    if (msgs.length === 0) return "";
    const latest = msgs[0];
    if (latest.is_unsend) return t("chat.unsent");
    if (latest.message_type === "IMAGE") return t("chat.imageMessage");
    if (latest.message_type === "VIDEO") return t("chat.videoMessage");
    if (latest.message_type === "DOCUMENT") return t("chat.fileMessage");
    return decryptMessage(latest.message, item.conversation_id);
  }, [t]);

  /* ── Conversations ─────────────────────────── */
  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await adminRequest({
        path: `${GROUP_MEMBER}${GET_GROUP_MEMBER_OF_USER}`,
        data: { user_id: currentUser.id },
      });
      const list = (Array.isArray(data) ? data : []).filter(
        (c) =>
          !c.conversation?.delete_conversations?.some(
            (d) => d.user_id === currentUser.id
          )
      );
      const seen = new Set();
      const unique = list.filter((c) => {
        if (seen.has(c.conversation_id)) return false;
        seen.add(c.conversation_id);
        return true;
      });
      setConversations(unique);
    } catch {
      setConversations([]);
    } finally {
      setLoadingList(false);
    }
  }, [currentUser.id]);

  /* ── Messages ──────────────────────────────── */
  const loadMessages = useCallback(
    async (conversation) => {
      if (!conversation) return;
      setLoadingMsg(true);
      try {
        const data = await adminRequest({
          path: `${MESSAGE}${SEARCH_MESSAGE_WITH_CONVERSATION}`,
          data: { conversation_id: conversation.conversation_id },
        });
        const list = (Array.isArray(data) ? data : []).filter(
          (m) =>
            !(m.delete_messages || []).some(
              (d) => d.user_id === currentUser.id
            )
        );
        setMessages(list);
      } catch {
        setMessages([]);
      } finally {
        setLoadingMsg(false);
      }
    },
    [currentUser.id]
  );

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 120);
  }, []);

  const selectConversation = async (conversation) => {
    socket.emit("joinConversation", conversation.conversation_id);
    setActive(conversation);
    await loadMessages(conversation);
    scrollToBottom();
  };

  /* ── Socket listeners ──────────────────────── */
  useEffect(() => {
    if (!active?.conversation_id) return;
    const room = active.conversation_id;

    const handleNewMessage = (payload) => {
      const msg = payload?.data || payload;
      if (msg?.conversation_id !== room) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
      loadConversations();
    };
    const handleUnsend = (data) => {
      if (!data?.success) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.id ? { ...m, is_unsend: true } : m
        )
      );
      loadConversations();
    };
    const handleDeleted = (data) => {
      if (!data?.success) return;
      loadMessages(active);
      loadConversations();
    };

    socket.on(room, handleNewMessage);
    socket.on("message_un_sended", handleUnsend);
    socket.on("deleted_message", handleDeleted);
    return () => {
      socket.off(room, handleNewMessage);
      socket.off("message_un_sended", handleUnsend);
      socket.off("deleted_message", handleDeleted);
    };
  }, [active, loadConversations, loadMessages, scrollToBottom]);

  useEffect(() => {
    loadConversations();
    return () => {
      if (active?.conversation_id) socket.emit("leaveConversation", active.conversation_id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Send ──────────────────────────────────── */
  const pushMessage = useCallback(
    async (messageText, messageType) => {
      if (!active?.conversation_id || !messageText) return;
      setSending(true);
      const payload = {
        conversation_id: active.conversation_id,
        user_id: currentUser.id,
        message:
          messageType === "TEXT"
            ? encryptMessage(messageText, active.conversation_id)
            : messageText,
        message_type: messageType,
      };
      socket.emit("send-message", payload);
      setText("");
      setUploading(false);
      setSending(false);
    },
    [active?.conversation_id, currentUser.id]
  );

  const handleSend = () => {
    if (!text.trim()) return;
    pushMessage(text.trim(), "TEXT");
    scrollToBottom();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !active) return;
    setUploading(true);
    try {
      const mediaPath = await adminRequest({
        method: "post",
        path: `${MESSAGE}${CREATE}`,
        data: (() => {
          const fd = new FormData();
          fd.append("media", file);
          return fd;
        })(),
      });
      await pushMessage(String(mediaPath), guessMessageType(file.name));
      scrollToBottom();
    } catch {
      setUploading(false);
    } finally {
      event.target.value = "";
    }
  };

  const handleUnsend = async (msg) => {
    if (msg.is_unsend) return;
    socket.emit("un_send_message", {
      message_id: msg.id,
      conversation_id: active.conversation_id,
    });
  };

  const handleDeleteMessage = async (msg) => {
    socket.emit("delete_message", {
      message_id: msg.id,
      user_id: currentUser.id,
      conversation_id: active.conversation_id,
    });
  };

  /* ── New chat ──────────────────────────────── */
  const openNewChat = async () => {
    setShowNewChat(true);
    try {
      const data = await adminRequest({
        method: "get",
        path: USER_URL,
      });
      const allUsers = Array.isArray(data) ? data : [];
      setUsers(
        allUsers.filter(
          (u) => u.id !== currentUser.id && u.is_active !== false
        )
      );
    } catch {
      setUsers([]);
    }
  };

  const createConversation = async (receiver) => {
    try {
      const data = await adminRequest({
        path: `${CONVERSATION}${CREATE}`,
        data: { sender_id: currentUser.id, receiver_id: receiver.id },
      });
      const conversationId = data?.conversation_id;
      if (!conversationId) return;
      setShowNewChat(false);
      await loadConversations();
      const found = conversations.find(
        (c) => c.conversation_id === conversationId
      );
      if (found) {
        await selectConversation(found);
      } else {
        // Tạo item tạm nếu chưa có trong list
        const item = {
          conversation_id: conversationId,
          group_type: "SINGLE",
          conversation: { title: receiver.name, messages: [] },
          users: { id: receiver.id, name: receiver.name, avatar: receiver.avatar },
        };
        setConversations((prev) => [...prev, item]);
        selectConversation(item);
      }
    } catch {
      setShowNewChat(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!active) return;
    try {
      await adminRequest({
        path: `${CONVERSATION}${DELETE}`,
        data: { conversation_id: active.conversation_id, user_id: currentUser.id },
      });
      setConversations((prev) =>
        prev.filter((c) => c.conversation_id !== active.conversation_id)
      );
      setActive(null);
      setMessages([]);
    } catch {
      /* silent */
    }
  };

  const filteredConversations = useMemo(() => {
    const kw = searchText.trim().toLowerCase();
    if (!kw) return conversations;
    return conversations.filter((c) =>
      conversationName(c).toLowerCase().includes(kw)
    );
  }, [conversations, searchText, conversationName]);

  const renderedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    [messages]
  );

  return (
    <div className="bg-light min-vh-100 p-2 p-md-3">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#1a7f37" }}>
            {t("chat")}
          </h2>
          <div className="text-muted">{t("chatCenterSubtitle")}</div>
        </div>
        <CButton color="success" size="sm" onClick={openNewChat}>
          + {t("chat.new")}
        </CButton>
      </div>

      <CCard className="shadow-sm border-0 rounded-4 overflow-hidden">
        <CCardBody className="p-0">
          <div className="d-flex" style={{ minHeight: "68vh" }}>
            {/* ── List ── */}
            <div
              className="border-end d-flex flex-column"
              style={{ width: "clamp(260px, 30%, 340px)" }}
            >
              <div className="p-2">
                <CInputGroup size="sm">
                  <CInputGroupText>
                    <CIcon icon={cilSearch} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder={t("search")}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </CInputGroup>
              </div>
              <div className="flex-grow-1 overflow-auto" style={{ maxHeight: "60vh" }}>
                {loadingList ? (
                  <div className="text-center py-5">
                    <CSpinner color="success" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center text-muted py-5">{t("chat.empty")}</div>
                ) : (
                  filteredConversations.map((c) => {
                    const isActive = active?.conversation_id === c.conversation_id;
                    const lastFromOther =
                      (c.conversation?.messages?.[0]?.user_id || "") !== currentUser.id;
                    return (
                      <button
                        key={c.conversation_id}
                        type="button"
                        onClick={() => selectConversation(c)}
                        className="btn btn-light border-0 w-100 text-start rounded-0 px-3 py-2"
                        style={{
                          background: isActive ? "#e9f7ee" : undefined,
                          borderLeft: isActive ? "4px solid #1a7f37" : "4px solid transparent",
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={c.users?.avatar || "/avatar-empty.png"}
                            alt=""
                            className="rounded-circle flex-shrink-0"
                            style={{ width: 40, height: 40, objectFit: "cover" }}
                          />
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-semibold text-truncate">
                                {conversationName(c)}
                              </span>
                              {lastFromOther && (
                                <span
                                  className="ms-1 rounded-circle flex-shrink-0"
                                  style={{
                                    width: 8,
                                    height: 8,
                                    background: "#1a7f37",
                                  }}
                                />
                              )}
                            </div>
                            <div className="small text-muted text-truncate">
                              {lastMessagePreview(c)}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── Thread ── */}
            <div className="flex-grow-1 d-flex flex-column">
              {!active ? (
                <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted">
                  {t("chat.selectHint")}
                </div>
              ) : (
                <>
                  {/* header */}
                  <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom bg-white">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={active.users?.avatar || "/avatar-empty.png"}
                        alt=""
                        className="rounded-circle"
                        style={{ width: 36, height: 36, objectFit: "cover" }}
                      />
                      <div>
                        <div className="fw-semibold">{conversationName(active)}</div>
                        <div className="small text-muted">
                          {active.group_type === "GROUP" ? t("chat.group") : t("chat.peer")}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <CButton
                        size="sm"
                        color="light"
                        variant="outline"
                        title={t("chat.deleteConversation")}
                        onClick={handleDeleteConversation}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </div>
                  </div>

                  {/* body */}
                  <div className="flex-grow-1 overflow-auto bg-light p-3" style={{ maxHeight: "48vh" }}>
                    {loadingMsg ? (
                      <div className="text-center py-5">
                        <CSpinner color="success" />
                      </div>
                    ) : renderedMessages.length === 0 ? (
                      <div className="text-center text-muted py-5">{t("chat.noMessages")}</div>
                    ) : (
                      renderedMessages.map((msg) => {
                        const mine = msg.user_id === currentUser.id;
                        const isImage = msg.message_type === "IMAGE";
                        const body = msg.is_unsend
                          ? t("chat.unsent")
                          : isImage
                            ? ""
                            : decryptMessage(msg.message, active.conversation_id);
                        return (
                          <div
                            key={msg.id}
                            className="d-flex mb-2"
                            style={{ justifyContent: mine ? "flex-end" : "flex-start" }}
                          >
                            <div
                              className="px-3 py-2 rounded-4 shadow-sm"
                              style={{
                                maxWidth: "70%",
                                background: mine
                                  ? "linear-gradient(90deg,#1a7f37,#43e97b)"
                                  : "#fff",
                                color: mine ? "#fff" : "#222",
                              }}
                            >
                              {!mine && (
                                <img
                                  src={msg.user?.avatar || "/avatar-empty.png"}
                                  alt=""
                                  className="rounded-circle mb-1"
                                  style={{ width: 22, height: 22, objectFit: "cover" }}
                                />
                              )}
                              {isImage ? (
                                <a href={String(msg.message)} target="_blank" rel="noreferrer">
                                  <img
                                    src={String(msg.message)}
                                    alt="attachment"
                                    className="rounded-3"
                                    style={{ maxWidth: 220, maxHeight: 220 }}
                                  />
                                </a>
                              ) : (
                                <span className="text-break">
                                  {String(body)}
                                </span>
                              )}
                              <div
                                className="small"
                                style={{ opacity: 0.8, fontSize: 11 }}
                              >
                                {moment(msg.created_at).format("HH:mm DD/MM")}
                              </div>
                              {mine && !msg.is_unsend && (
                                <div className="d-flex gap-2 mt-1">
                                  <button
                                    type="button"
                                    className="btn btn-sm p-0 border-0 bg-transparent"
                                    style={{ color: "#fff", fontSize: 11 }}
                                    onClick={() => handleUnsend(msg)}
                                  >
                                    {t("chat.unsend")}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm p-0 border-0 bg-transparent"
                                    style={{ color: "#fff", fontSize: 11 }}
                                    onClick={() => handleDeleteMessage(msg)}
                                  >
                                    {t("chat.delete")}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* input */}
                  <div className="px-3 py-2 border-top bg-white">
                    <CInputGroup>
                      <input
                        ref={fileRef}
                        type="file"
                        hidden
                        onChange={handleFileChange}
                      />
                      <CButton
                        color="light"
                        variant="outline"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        title={t("chat.attach")}
                      >
                        {uploading ? (
                          <CSpinner size="sm" />
                        ) : (
                          <CIcon icon={cilImage} />
                        )}
                      </CButton>
                      <CFormInput
                        value={text}
                        placeholder={t("chat.placeholder")}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                      />
                      <CButton
                        color="success"
                        onClick={handleSend}
                        disabled={sending || !text.trim()}
                        title={t("chat.send")}
                      >
                        <CIcon icon={cilPaperPlane} />
                      </CButton>
                    </CInputGroup>
                  </div>
                </>
              )}
            </div>
          </div>
        </CCardBody>
      </CCard>

      {/* ── New chat modal ── */}
      <CModal
        visible={showNewChat}
        onClose={() => setShowNewChat(false)}
        alignment="center"
        scrollable
      >
        <CModalHeader className="border-0 rounded-top-4"
          style={{ background: "linear-gradient(90deg,#1a7f37,#43e97b)" }}
        >
          <CModalTitle className="text-white fw-bold">{t("chat.new")}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {users.length === 0 ? (
            <div className="text-center text-muted py-4">{t("chat.noUsers")}</div>
          ) : (
            <div className="list-group list-group-flush">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className="list-group-item list-group-item-action d-flex align-items-center gap-2 border-0"
                  onClick={() => createConversation(u)}
                >
                  <img
                    src={u.avatar || "/avatar-empty.png"}
                    alt=""
                    className="rounded-circle"
                    style={{ width: 32, height: 32, objectFit: "cover" }}
                  />
                  <div>
                    <div className="fw-semibold">{u.name}</div>
                    <div className="small text-muted">
                      {u.employee_id} · {u.position}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CModalBody>
      </CModal>
    </div>
  );
};

export default ChatCenter;