import { Input } from "@nextui-org/react";
import { Address } from "../../types/questions";
// import { toast } from "react-toastify";
// import api from "../../utils/api";
import { useState } from "react";

export const AddressContentLink = ({
  question,
}: //   callback,
{
  question: Address;
  //   callback: () => void;
}) => {
  const [address, setAddress] = useState<Address>({ ...question });
  //   const [loading, setLoading] = useState(false);

  //   const handleSave = async () => {
  //     setLoading(true);
  //     try {
  //       const { response } = await api.patch(`questions/${question.id}`, {
  //         updated: address,
  //       });
  //       if (!response.ok) {
  //         throw new Error();
  //       }

  //       callback();
  //       toast.success("Updated successfully");
  //     } catch (err) {
  //       console.error(err);
  //       toast.error("Failed to update address");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const hasChanged = () => {
  //     return address.link !== question.link;
  //   };

  return (
    <div className="flex flex-col gap-6 pb-6">
      <Input
        variant="faded"
        disabled
        label={question.prompt}
        value={address.link}
        onValueChange={(val) => setAddress({ ...address, link: val })}
      />
      {/* <Button
        color="primary"
        isLoading={loading}
        onPress={handleSave}
        isDisabled={!hasChanged() || !isValidUrl(address.link)}
        className="mt-auto"
      >
        Save
      </Button> */}
    </div>
  );
};
