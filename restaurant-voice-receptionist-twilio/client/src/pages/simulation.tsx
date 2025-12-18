import {
  IconMicrophoneFilled,
  IconPlugConnected,
  IconPhoneFilled,
  IconPhoneOff,
  IconHistory,
} from "@tabler/icons-react";
import {
  setupAudioListener,
  disconnectSocket,
  connectSocket,
  sendAudio,
} from "../utils/socketService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SimulationStatus } from "../types/simulationStatus";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { SimulationAudio } from "../types/simulationAudio";
import { formatTime, formatTimestamp } from "../utils/sim";
import { Button, Spinner } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";

export const Simulation = () => {
  const testConnection = async () => {
    const id = toast.loading("Sending request...");

    try {
      const { response } = await api.get(``);

      if (response.ok) {
        toast.update(id, {
          render: "Connection successful",
          type: "success",
          isLoading: false,
          autoClose: 1000,
        });
      } else {
        throw new Error("Connection failed");
      }
    } catch (err) {
      console.error(err);
      toast.update(id, {
        render: "Connection failed",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  const [audios, setAudios] = useState<SimulationAudio[]>([]);
  const audioHistoryContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScrollToBottom = () => {
      if (audioHistoryContainer.current) {
        audioHistoryContainer.current.scrollTop =
          audioHistoryContainer.current.scrollHeight;
      }
    };

    handleScrollToBottom();
  }, [audios.length]);

  const [simStatus, setSimStatus] = useState<SimulationStatus>("idle");
  const [time, setTime] = useState(0);

  const handleClick = async () => {
    if (simStatus === "idle") {
      startCall();
    } else if (simStatus === "ongoing") {
      endCall();
    }
  };

  const startCall = async () => {
    setAudios([]);
    setSimStatus("loading");
    const id = toast.loading("Calling...");

    try {
      const greeting = await connectSocket();
      setAudios((prevAudios) => [
        ...prevAudios,
        {
          timestamp: new Date(),
          audio: greeting,
          isReceived: true,
        },
      ]);
      playAudio(greeting);

      setSimStatus("ongoing");
      setTime(0);
      toast.update(id, {
        render: "Call connected",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (__) {
      toast.update(id, {
        render: "Connection failed",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
      setSimStatus("idle");
    }
  };

  const handleSendAudio = async (audio: Blob) => {
    const id = toast.loading("Sending audio...");

    try {
      await sendAudio(audio);
      toast.update(id, {
        render: "Audio Sent",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (__) {
      toast.update(id, {
        render: "Failed to send audio",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  useEffect(() => {
    if (simStatus === "ongoing") {
      setupAudioListener((audio: string, end?: boolean) => {
        setAudios((prevAudios) => [
          ...prevAudios,
          {
            timestamp: new Date(),
            audio,
            isReceived: true,
          },
        ]);
        playAudio(audio);
        if (end) {
          setTimeout(() => {
            endCall();
          }, 2000);
        }
      });
    }
  }, [simStatus]);

  const endCall = async () => {
    const id = toast.loading("Ending call...");

    try {
      await disconnectSocket();

      toast.dismiss();

      setSimStatus("idle");
      toast.update(id, {
        render: "Call ended",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (__) {
      toast.update(id, {
        render: "Error ending call",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (simStatus === "ongoing") {
      interval = setInterval(() => {
        setTime((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else {
      if (interval) {
        clearInterval(interval);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [simStatus]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (simStatus !== "ongoing") {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      handleSendAudio(audioBlob);

      setAudios((prevAudios) => [
        ...prevAudios,
        {
          timestamp: new Date(),
          audio: URL.createObjectURL(audioBlob),
          isReceived: false,
        },
      ]);

      audioChunksRef.current = [];
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    if (simStatus !== "ongoing") {
      return;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const playAudio = async (audio: string) => {
    const audioElement = new Audio(audio);
    audioElement.play();
  };

  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-gray-100 flex flex-col gap-2 flex-1 w-full h-full">
        <h1 className="text-3xl font-light text-black font-bebas tracking-wide">
          Simulation
        </h1>

        <button
          className="bg-yellow-400 hover:bg-yellow-600 text-black text-md py-3 px-4 rounded-2xl font-bebas tracking-wide transition-all self-end flex gap-2"
          onClick={testConnection}
        >
          Test Connection
          <IconPlugConnected className="h-5 w-5 flex-shrink-0 " />
        </button>
        <div className="w-full h-full mt-5 rounded-xl shadow-2xl border-1 border-gray-100 flex flex-col p-6 gap-6 overflow-hidden">
          <div className="flex items-center justify-between">
            <Button
              color={
                simStatus == "idle"
                  ? "primary"
                  : simStatus == "loading"
                  ? "warning"
                  : "danger"
              }
              isIconOnly
              className="w-auto h-auto p-4"
              isLoading={simStatus === "loading"}
              spinner={
                <Spinner
                  color="current"
                  classNames={{
                    wrapper: "w-12 h-12",
                  }}
                />
              }
              radius="lg"
              onClick={handleClick}
            >
              {simStatus === "idle" ? (
                <IconPhoneFilled height="3rem" width="3rem" />
              ) : (
                <IconPhoneOff height="3rem" width="3rem" />
              )}
            </Button>
            <p className="font-jost text-xl">{formatTime(time)}</p>
          </div>
          <div className="flex items-center justify-start gap-5">
            <Button
              isIconOnly
              className="w-auto h-auto p-4"
              disabled={simStatus !== "ongoing"}
              radius="lg"
              onPressStart={startRecording}
              onPressEnd={stopRecording}
            >
              <IconMicrophoneFilled
                className="fill-red1"
                height="3rem"
                width="3rem"
              />
            </Button>
            <p className="font-jost text-lg text-gray-500">
              Press and hold to record
              <br />
              Release to send
            </p>
          </div>

          <div
            className="flex flex-col justify-start h-full border-1 border-gray-200 rounded-lg overflow-y-scroll gap-5 py-5"
            ref={audioHistoryContainer}
          >
            {!audios.length && (
              <div className="text-center self-center my-auto flex flex-col items-center">
                <IconHistory color="gray" height="3rem" width="3rem" />
                <p className="text-lg mt-2">No history</p>
                <p className="text-md text-gray-600">
                  Start a call to see audios
                </p>
              </div>
            )}
            {audios.length > 0 &&
              audios.map((audio, index) => (
                <div
                  className={`w-full flex items-start ${
                    !audio.isReceived ? "ml-auto justify-end" : ""
                  }`}
                  key={index}
                  data-message-key={index}
                >
                  <div
                    className="max-w-[60%] flex justify-center mx-4 font-medium bg-gray-100 px-3 py-4 text-gray-700 gap-3 items-center"
                    style={{
                      borderRadius: audio.isReceived
                        ? "0px 15px 15px 15px"
                        : "15px 0px 15px 15px",
                    }}
                  >
                    <Button
                      isIconOnly
                      endContent={<FontAwesomeIcon icon={faPlay} />}
                      color="danger"
                      onPress={() => playAudio(audio.audio)}
                    />
                    <div className={audio.isReceived ? "ml-auto" : "mr-auto"}>
                      {formatTimestamp(audio.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
