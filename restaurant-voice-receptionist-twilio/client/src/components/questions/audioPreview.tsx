import { faPlay, faStop } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatTime } from "../../utils/sim";
import { Button } from "@nextui-org/react";
import { toast } from "react-toastify";
import ReactPlayer from "react-player";
import api from "../../utils/api";
import { useState } from "react";

type AudioPreviewStatus = "idle" | "loading" | "playing";

export const AudioPreview = ({ previewString }: { previewString: string }) => {
  const [status, setStatus] = useState<AudioPreviewStatus>("idle");
  const [audioUrl, setAudioUrl] = useState<string>("");

  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const handleButton = async () => {
    if (status === "idle") {
      loadPreview();
    } else if (status === "playing") {
      handleEnd();
    }
  };

  const loadPreview = async () => {
    setStatus("loading");
    try {
      const { response, data } = await api.post(`questions/preview`, {
        preview_text: previewString,
      });

      if (!response.ok) {
        throw new Error();
      }

      setAudioUrl(URL.createObjectURL(data));
      setStatus("playing");
    } catch (err) {
      console.error(err);
      toast.error("Failed to preview audio");
      setStatus("idle");
    }
  };

  const handleEnd = () => {
    setStatus("idle");
    setCurrentTime(0);
    setTotalTime(0);
    setAudioUrl("");
  };

  return (
    <div>
      {status === "playing" && (
        <ReactPlayer
          width={0}
          height={0}
          url={audioUrl}
          playing={true}
          progressInterval={100}
          onProgress={(state) => setCurrentTime(state.playedSeconds)}
          onDuration={(duration) => {
            if (duration != Infinity) {
              setTotalTime(duration);
            }
          }}
          onEnded={handleEnd}
        />
      )}

      <div className="flex items-center gap-3">
        <Button
          onPress={handleButton}
          isLoading={status === "loading"}
          isIconOnly
          color={
            status === "loading"
              ? "warning"
              : status === "playing"
              ? "danger"
              : "primary"
          }
        >
          <FontAwesomeIcon icon={status === "playing" ? faStop : faPlay} />
        </Button>
        <p>{formatTime(Number(currentTime.toFixed(0)))}</p>
        <div className="relative w-full h-2 bg-gray-200 rounded-lg">
          {status === "playing" && (
            <div
              className="absolute top-0 left-0 h-2 rounded-lg bg-red1"
              style={{ width: `${(currentTime / totalTime) * 100}%` }}
            />
          )}
        </div>
        <p>{formatTime(Number(totalTime.toFixed(0)))}</p>
      </div>
    </div>
  );
};
