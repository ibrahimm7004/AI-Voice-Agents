import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { formatDuration, formatPercentage } from "../../utils/string";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type ChangeType = "number" | "time" | "percentage";

export const AnalyticsCardFooter = ({
  change,
  type = "number",
}: {
  change: number;
  type?: ChangeType;
}) => {
  const changeText =
    type === "time"
      ? formatDuration(change)
      : type === "percentage"
      ? formatPercentage(change)
      : change;

  return (
    <p className="text-sm flex items-center justify-center w-full">
      <FontAwesomeIcon
        icon={change < 0 ? faCaretDown : faCaretUp}
        color={change < 0 ? "#f31260" : "#17c964"}
      />
      <span
        className="font-bold ml-1.5 mr-1"
        style={{
          color: change < 0 ? "#f31260" : "#17c964",
        }}
      >
        {changeText}
      </span>
      change from previous
    </p>
  );
};
