import { Button, Input } from "@nextui-org/react";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { useState } from "react";
import { Value } from "../../types/questions";
import { camelCaseToTitleCase } from "../../utils/string";

export const ValueContent = ({
  question,
  callback,
}: {
  question: Value;
  callback: () => void;
}) => {
  const [value, setValue] = useState<Value>({ ...question });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { response } = await api.patch(`questions/update/${question.id}`, {
        updated: value,
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
    return value.value !== question.value;
  };

  return (
    <div className="flex flex-col gap-6 pb-6">
      <Input
        variant="faded"
        disabled={loading}
        label={camelCaseToTitleCase(question.label)}
        value={value.value}
        onValueChange={(val) => setValue({ ...value, value: val })}
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
  );
};
