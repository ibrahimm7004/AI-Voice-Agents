import { Checkbox, CheckboxGroup } from "@nextui-org/react";
import { Other } from "../../types/questions";
import { toSentenceCase } from "../../utils/string";

export const OtherContent = ({ question }: { question: Other }) => {
  return (
    <div className="flex gap-6 pb-6">
      <div className="flex flex-col gap-6 w-2/4">
        <CheckboxGroup
          isDisabled
          label="Forward call for"
          value={question.prompts.map((method) => method)}
        >
          {question.prompts.map((method) => (
            <Checkbox value={method}>
              <span className="flex items-center justify-between">
                <p>{toSentenceCase(method)}</p>
              </span>
            </Checkbox>
          ))}
        </CheckboxGroup>
      </div>
    </div>
  );
};
