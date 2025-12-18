import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Radio,
  RadioGroup,
} from "@nextui-org/react";
import { getPreviewText } from "../../utils/questions";
import { Reservations } from "../../types/questions";
import { AudioPreview } from "./audioPreview";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { useState } from "react";

export const ReservationsContent = ({
  question,
  callback,
}: {
  question: Reservations;
  callback: () => void;
}) => {
  const [reservations, setReservations] = useState<Reservations>({
    ...question,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { response } = await api.patch(`questions/update/${question.id}`, {
        updated: reservations,
      });
      if (!response.ok) {
        throw new Error();
      }

      callback();
      toast.success("Updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update reservations");
    } finally {
      setLoading(false);
    }
  };

  const hasChanged = () => {
    return reservations.response !== question.response;
  };

  return (
    <div className="flex gap-6 pb-6">
      <div className="flex flex-col gap-6 w-2/4">
        <RadioGroup
          label={reservations.prompt}
          orientation="horizontal"
          value={reservations.response ? "yes" : "no"}
          onValueChange={(val) =>
            setReservations({ ...reservations, response: val === "yes" })
          }
        >
          <Radio color="success" value="yes">
            Yes
          </Radio>
          <Radio color="danger" value="no">
            No
          </Radio>
        </RadioGroup>

        <Button
          color="primary"
          isLoading={loading}
          onPress={handleSave}
          isDisabled={!hasChanged()}
          className="mt-auto"
        >
          Save
        </Button>
      </div>
      <Card className="w-2/4 p-3">
        <CardHeader>
          <p className="text-lg font-bold">Sample Preview</p>
        </CardHeader>

        <CardBody>
          <AudioPreview
            previewString={
              getPreviewText({
                type: "reservations",
                ...reservations,
              }).string
            }
          />
        </CardBody>

        <CardFooter className="flex flex-col items-start text-sm gap-1">
          <p>
            {
              getPreviewText({
                type: "reservations",
                ...reservations,
              }).paragraphs
            }
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
