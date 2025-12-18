import { io, Socket } from "socket.io-client";

const socketUrl = import.meta.env.VITE_WEBSOCKET_URL;
let socket: Socket | null = null;

export const connectSocket = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      socket = io(socketUrl);

      socket.on("connected", (data) => {
        const { audio_clip } = data;
        const audioBlob = new Blob([audio_clip], { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        resolve(audioUrl);
      });

      socket.on("connect_error", (err) => {
        console.error("Connection error:", err);
        reject(new Error("Connection failed"));
      });
    } catch (error) {
      console.error(error);
      reject(new Error("Failed to connect to the server"));
    }
  });
};

export const sendAudio = async (audioClip: Blob): Promise<void> => {
  if (!socket) {
    return Promise.reject(new Error("Socket not initialized"));
  }

  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const audioData = reader.result as ArrayBuffer;
        if (socket) {
          try {
            socket.emit("send_audio", { audio_clip: audioData }, () => {
              resolve();
            });
          } catch (error) {
            console.error(error);
          }
        }
      };

      reader.onerror = (err) => {
        reject(new Error(`Failed to read audio file: ${err}`));
      };

      reader.readAsArrayBuffer(audioClip);
    });
  } catch (error) {
    console.error(error);
    return Promise.reject(new Error("Failed to send audio"));
  }
};

export const setupAudioListener = (
  callback: (audioClip: string, end?: boolean) => void
): void => {
  if (!socket) {
    console.error("Socket is not connected");
    return;
  }

  socket.on("receive_audio", (data) => {
    const { audio_clip, end } = data;
    const audioBlob = new Blob([audio_clip], { type: "audio/wav" });
    const audioUrl = URL.createObjectURL(audioBlob);
    callback(audioUrl, end);
  });
};

export const disconnectSocket = async (): Promise<void> => {
  if (!socket) {
    return Promise.reject(new Error("Socket not initialized"));
  }

  return new Promise((resolve, reject) => {
    if (socket) {
      socket.disconnect();
      console.log("Disconnected from the server");
      resolve();
    } else {
      reject(new Error("Socket became null during disconnection"));
    }
  });
};
