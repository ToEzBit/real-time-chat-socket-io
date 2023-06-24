import { io } from "socket.io-client";
import { type FormEvent, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
const socket = io("http://localhost:3000");
dayjs.extend(relativeTime);

function App() {
  const statusRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLInputElement>(null);
  const roomRef = useRef<HTMLInputElement>(null);
  const chatBoxRef = useRef<HTMLUListElement>(null);
  const [joinedRoom, setJoinedRoom] = useState<boolean>(false);

  const [messages, setMessages] = useState<
    { message: string; isSender: boolean; date: Date }[]
  >([]);
  socket.on("connect", () => {
    if (!statusRef.current) return;
    statusRef.current.innerText = `Your Id ${socket.id}`;
  });

  useEffect(() => {
    socket.on("receive-message", (message) => {
      setMessages((prev) => [
        ...prev,
        { message, isSender: false, date: new Date() },
      ]);
    });
    return () => {
      socket.off("receive-message");
    };
  }, []);

  function sendMessage(event: FormEvent) {
    event.preventDefault();
    const enteredMessage = messageRef?.current?.value;
    const enteredRoom = roomRef?.current?.value;
    if (!enteredMessage) return;
    if (!enteredRoom) {
      messageRef.current.value = "";
    } else {
      socket.emit("send-message", enteredMessage, enteredRoom);
      setMessages((prev) => [
        ...prev,
        { message: enteredMessage, isSender: true, date: new Date() },
      ]);
      messageRef.current.value = "";
    }
  }

  useEffect(() => {
    const chatBox = chatBoxRef.current;
    if (chatBox?.lastElementChild) {
      chatBox.lastElementChild.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  function joinRoom(event: FormEvent) {
    event.preventDefault();
    const enteredRoom = roomRef?.current?.value;
    if (!enteredRoom) return;
    socket.emit("join-room", enteredRoom, (message: string) => {
      setMessages((prev) => [
        ...prev,
        { message: message, isSender: true, date: new Date() },
      ]);
    });
    setJoinedRoom(true);
  }
  return (
    <div
      style={{
        width: "100vw",
        display: "flex",
        position: "absolute",
        top: 0,
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <form
        onSubmit={joinRoom}
        style={{
          position: "relative",
          marginTop: "1%",
          width: "80%",
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10%",
          padding: "16px",
          height: "16px",
        }}
      >
        <p ref={statusRef}></p>

        <input
          placeholder="room id"
          style={{ width: "30%" }}
          ref={roomRef}
          disabled={joinedRoom}
        />

        <button
          style={{ backgroundColor: "#0695FF", color: "white" }}
          type="submit"
          disabled={joinedRoom}
        >
          join room
        </button>
      </form>
      <div
        style={{
          width: "80%",
          position: "relative",
          marginTop: "2%",
          border: "2px solid black",
          padding: "32px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            height: "550px",
          }}
        >
          <ul
            style={{ overflowY: "scroll", height: "90%", padding: "16px" }}
            ref={chatBoxRef}
          >
            {messages.map((message, idx) => (
              <li
                key={idx}
                style={{
                  listStyle: "none",
                  display: "flex",
                  alignItems: `${message.isSender ? "flex-end" : "flex-start"}`,
                  flexDirection: "column",
                }}
              >
                <p
                  style={{
                    padding: "12px",
                    backgroundColor: `${
                      message.isSender ? "#0695FF" : "#E4E6EB"
                    } `,
                    color: `${message.isSender ? "white" : "black"}`,
                    borderRadius: "12px",
                  }}
                >
                  {message.message}
                </p>
                <small style={{ marginTop: "-8px", color: "slategrey" }}>
                  {dayjs(message.date).fromNow()}
                </small>
              </li>
            ))}
          </ul>
        </div>
        <div
          style={{
            marginTop: "32px",
            width: "100%",
            gap: "20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <form style={{ display: "flex", gap: "10%" }} onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="message"
              style={{ flexGrow: 1 }}
              ref={messageRef}
              disabled={!joinedRoom}
            />
            <button
              style={{
                width: "20%",
                backgroundColor: "#0695FF",
                color: "white",
              }}
              type="submit"
              disabled={!joinedRoom}
            >
              send message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
