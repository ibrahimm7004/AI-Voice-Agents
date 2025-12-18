import { AnalyticsHours, getAnalyticsHours } from "../../types/analyticsHours";
import { AnalyticsDates, getAnalyticsDates } from "../../types/analyticsDates";
import {
  DropdownTrigger,
  DropdownItem,
  DropdownMenu,
  Dropdown,
  Button,
} from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faClock } from "@fortawesome/free-solid-svg-icons";

export const AnalyticsHeaderWithOptions = ({
  label,
  selectedHours,
  selectedDates,
  onHoursChange,
  onDatesChange,
}: {
  label: string;
  selectedHours: AnalyticsHours;
  selectedDates: AnalyticsDates;
  onHoursChange: (hours: AnalyticsHours) => void;
  onDatesChange: (dates: AnalyticsDates) => void;
}) => {
  return (
    <div className="flex flex-row items-center justify-between w-full pb-4 border-b-2">
      <h4 className="text-xl text-black font-medium">{label}</h4>
      <div className="flex flex-row gap-4">
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="bordered"
              color="danger"
              startContent={
                <FontAwesomeIcon icon={faClock} color="#f31260" size={"lg"} />
              }
            >
              {selectedHours}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="Single selection example"
            selectedKeys={[selectedHours.toString()]}
            selectionMode="single"
            variant="flat"
            onSelectionChange={(selected) => {
              onHoursChange(selected.currentKey as AnalyticsHours);
            }}
          >
            {getAnalyticsHours().map((hour) => (
              <DropdownItem key={hour.toString()}>{hour}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="solid"
              color="warning"
              startContent={<FontAwesomeIcon icon={faCalendar} size={"lg"} />}
            >
              {selectedDates}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="Single selection example"
            selectedKeys={[selectedDates.toString()]}
            selectionMode="single"
            variant="flat"
            onSelectionChange={(selected) => {
              onDatesChange(selected.currentKey as AnalyticsDates);
            }}
          >
            {getAnalyticsDates().map((date) => (
              <DropdownItem key={date.toString()}>{date}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export const AnalyticsHeader = ({ label }: { label: string }) => {
  return (
    <div className="flex flex-row items-center justify-between w-full pb-4 border-b-2 mt-6">
      <h4 className="text-xl text-black font-medium">{label}</h4>
    </div>
  );
};
