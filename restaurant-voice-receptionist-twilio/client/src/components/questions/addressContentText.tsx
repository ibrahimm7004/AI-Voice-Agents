import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Textarea,
} from "@nextui-org/react";
import { getPreviewText } from "../../utils/questions";
import { Address } from "../../types/questions";
import { AudioPreview } from "./audioPreview";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { useState } from "react";

export const AddressContentText = ({
  question,
  callback,
}: {
  question: Address;
  callback: () => void;
}) => {
  const [address, setAddress] = useState<Address>({ ...question });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { response } = await api.patch(`questions/update/${question.id}`, {
        updated: address,
      });
      if (!response.ok) {
        throw new Error();
      }

      callback();
      toast.success("Updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  const hasChanged = () => {
    return address.response !== question.response;
  };

  return (
    <div className="flex gap-6 pb-6">
      <div className="flex flex-col gap-6 w-2/4">
        <Textarea
          variant="faded"
          label={question.prompt}
          value={address.response}
          onValueChange={(val) => setAddress({ ...address, response: val })}
        />
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
                type: "address",
                ...address,
              }).string
            }
          />
        </CardBody>

        <CardFooter className="flex flex-col items-start text-sm gap-1">
          {
            getPreviewText({
              type: "address",
              ...address,
            }).paragraphs
          }
        </CardFooter>
      </Card>
    </div>
  );
};
