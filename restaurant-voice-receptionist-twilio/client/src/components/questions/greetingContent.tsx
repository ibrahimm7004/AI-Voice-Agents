import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Radio,
  RadioGroup,
  Textarea,
} from "@nextui-org/react";
import { getPreviewText } from "../../utils/questions";
import { Greeting } from "../../types/questions";
import { AudioPreview } from "./audioPreview";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { useState } from "react";

export const GreetingContent = ({
  question,
  callback,
}: {
  question: Greeting;
  callback: () => void;
}) => {
  const [greeting, setGreeting] = useState<Greeting>({ ...question });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { response } = await api.patch(`questions/update/${question.id}`, {
        updated: greeting,
      });
      if (!response.ok) {
        throw new Error();
      }

      callback();
      toast.success("Updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update greeting");
    } finally {
      setLoading(false);
    }
  };

  const hasChanged = () => {
    return (
      greeting.add_tagline !== question.add_tagline ||
      greeting.tagline !== question.tagline
    );
  };

  return (
    <div className="flex gap-6 pb-6">
      <div className="flex flex-col gap-6 w-2/4">
        <RadioGroup
          label=" After thanking the guest for calling, would you like to add a short
        tagline?"
          orientation="horizontal"
          value={greeting.add_tagline ? "yes" : "no"}
          onValueChange={(val) =>
            setGreeting({ ...greeting, add_tagline: val === "yes" })
          }
        >
          <Radio color="success" value="yes">
            Yes
          </Radio>
          <Radio color="danger" value="no">
            No
          </Radio>
        </RadioGroup>
        <Textarea
          variant="faded"
          label="Tagline"
          isDisabled={!greeting.add_tagline}
          value={greeting.tagline}
          onValueChange={(val) => setGreeting({ ...greeting, tagline: val })}
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
                type: "greeting",
                ...greeting,
              }).string
            }
          />
        </CardBody>

        <CardFooter className="flex flex-col items-start text-sm gap-1">
          {
            getPreviewText({
              type: "greeting",
              ...greeting,
            }).paragraphs
          }
        </CardFooter>
      </Card>
    </div>
  );
};
