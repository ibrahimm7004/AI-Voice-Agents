import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  CheckboxGroup,
  Link,
  Radio,
  RadioGroup,
} from "@nextui-org/react";
import { Pickup, Delivery, Catering } from "../../types/questions";
import { getPreviewText } from "../../utils/questions";
import { toSentenceCase } from "../../utils/string";
import { AudioPreview } from "./audioPreview";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { useState } from "react";

export const PickupDeliveryCateringContent = ({
  question,
  callback,
}: {
  question: Pickup | Delivery | Catering;
  callback: () => void;
}) => {
  const [data, setData] = useState<Pickup | Delivery | Catering>({
    ...question,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { response } = await api.patch(`questions/update/${question.id}`, {
        updated: data,
      });
      if (!response.ok) {
        throw new Error();
      }

      callback();
      toast.success("Updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const hasChanged = () => {
    if (data.response !== question.response) {
      return true;
    }

    for (let i = 0; i < data.methods.length; i++) {
      if (data.methods[i].available !== question.methods[i].available) {
        return true;
      }
    }
  };

  return (
    <div className="flex gap-6 pb-6">
      <div className="flex flex-col gap-6 w-2/4">
        <RadioGroup
          label={data.prompt}
          orientation="horizontal"
          value={data.response ? "yes" : "no"}
          onValueChange={(val) =>
            setData({
              ...data,
              response: val === "yes",
            })
          }
        >
          <Radio color="success" value="yes">
            Yes
          </Radio>
          <Radio color="danger" value="no">
            No
          </Radio>
        </RadioGroup>
        <CheckboxGroup
          isDisabled={!data.response}
          label="Select available methods"
          value={data.methods
            .filter((method) => method.available)
            .map((method) => method.method)}
          onValueChange={(selected) => {
            console.log(selected);

            const methods = data.methods.map((method) => ({
              ...method,
              available: selected.includes(method.method),
            }));

            console.log(methods);
            setData({ ...data, methods });
          }}
        >
          {data.methods.map((method) => (
            <Checkbox value={method.method}>
              <span className="flex items-center justify-between">
                <p>{toSentenceCase(method.method)}</p>
                {method.link && (
                  <Link href={method.link} underline="active" isExternal>
                    (Website)
                  </Link>
                )}
              </span>
            </Checkbox>
          ))}
        </CheckboxGroup>
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
                type: question.prompt.toLowerCase() as
                  | "pickup"
                  | "delivery"
                  | "catering",
                ...data,
              }).string
            }
          />
        </CardBody>

        <CardFooter className="flex flex-col items-start text-sm gap-1">
          {
            getPreviewText({
              type: question.prompt.toLowerCase() as
                | "pickup"
                | "delivery"
                | "catering",
              ...data,
            }).paragraphs
          }
        </CardFooter>
      </Card>
    </div>
  );
};
