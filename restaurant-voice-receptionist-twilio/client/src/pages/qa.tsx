import {
  Accordion,
  AccordionItem,
  Skeleton,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { DietaryAccommodationsContent } from "../components/questions/dietaryAccommodationssContent";
import { PickupDeliveryCateringContent } from "../components/questions/pickupDeliveryCateringContent";
import { ReservationsContent } from "../components/questions/reservationContent";
import { AddressContentText } from "../components/questions/addressContentText";
import { AddressContentLink } from "../components/questions/addressContentLink";
import { GreetingContent } from "../components/questions/greetingContent";
import { OtherContent } from "../components/questions/otherContent";
import { ValueContent } from "../components/questions/valueContent";
import { getIcon, getSubtitle, getTitle } from "../utils/questions";
import { Question, tabOptions } from "../types/questions";
import { faPencil, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";

export const QA = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTab, setSelectedTab] = useState(tabOptions[0].title);

  const fetchQA = async () => {
    setQuestions([]);
    try {
      const { response, data } = await api.get(`questions/categories`);

      if (!response.ok) {
        throw new Error();
      }

      setQuestions(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch questions");
    }
  };

  useEffect(() => {
    fetchQA();
  }, []);

  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-gray-100 flex flex-col gap-2 flex-1 w-full h-full">
        <h1 className="text-3xl font-light text-black font-bebas tracking-wide">
          Question/Answers
        </h1>
        <Skeleton
          isLoaded={questions.length > 0}
          className="w-full h-full mt-5 flex flex-col gap-6 rounded-xl"
          classNames={{ content: "flex flex-col h-full" }}
        >
          <Tabs
            aria-label="Questions"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(String(key))}
          >
            {tabOptions.map((tab) => (
              <Tab key={tab.title} title={tab.title}>
                <div className="h-full bg-red-300 w-full"></div>
              </Tab>
            ))}
          </Tabs>
          {selectedTab === "Greeting & Reservations" && (
            <Accordion variant="shadow">
              {questions
                .filter(
                  (question) =>
                    question.type == "greeting" ||
                    question.type == "reservations"
                )
                .map((question, index) => {
                  const title = getTitle(question);
                  const subtitle = getSubtitle(question);
                  const icon = getIcon(title);

                  return (
                    <AccordionItem
                      key={index}
                      aria-label={title}
                      title={title}
                      subtitle={subtitle}
                      indicator={({ isOpen }) => (
                        <FontAwesomeIcon
                          icon={isOpen ? faXmark : faPencil}
                          className="text-gray-500"
                        />
                      )}
                      startContent={
                        <FontAwesomeIcon
                          icon={icon}
                          size={"xl"}
                          className="text-gray-500"
                        />
                      }
                    >
                      {question.type === "greeting" ? (
                        <GreetingContent
                          question={question}
                          callback={fetchQA}
                        />
                      ) : (
                        <ReservationsContent
                          question={question}
                          callback={fetchQA}
                        />
                      )}
                    </AccordionItem>
                  );
                })}
            </Accordion>
          )}
          {selectedTab === "Address" && (
            <Accordion variant="shadow">
              {questions
                .filter((question) => question.type == "address")
                .map((question, index) => {
                  const title = getTitle(question);
                  const subtitle = getSubtitle(question);
                  const icon = getIcon(title);

                  return (
                    <AccordionItem
                      key={index}
                      aria-label={title}
                      title={title}
                      subtitle={subtitle}
                      indicator={({ isOpen }) => (
                        <FontAwesomeIcon
                          icon={isOpen ? faXmark : faPencil}
                          className="text-gray-500"
                        />
                      )}
                      startContent={
                        <FontAwesomeIcon
                          icon={icon}
                          size={"xl"}
                          className="text-gray-500"
                        />
                      }
                    >
                      {question.prompt ? (
                        <AddressContentText
                          question={question}
                          callback={fetchQA}
                        />
                      ) : (
                        <AddressContentLink
                          question={question}
                          //   callback={fetchQA}
                        />
                      )}
                    </AccordionItem>
                  );
                })}
            </Accordion>
          )}
          {selectedTab === "Pickup, delivery & Catering" && (
            <Accordion variant="shadow">
              {questions
                .filter(
                  (question) =>
                    question.type == "pickup" ||
                    question.type == "delivery" ||
                    question.type == "catering"
                )
                .map((question, index) => {
                  const title = getTitle(question);
                  const subtitle = getSubtitle(question);
                  const icon = getIcon(title);

                  return (
                    <AccordionItem
                      key={index}
                      aria-label={title}
                      title={title}
                      subtitle={subtitle}
                      indicator={({ isOpen }) => (
                        <FontAwesomeIcon
                          icon={isOpen ? faXmark : faPencil}
                          className="text-gray-500"
                        />
                      )}
                      startContent={
                        <FontAwesomeIcon
                          icon={icon}
                          size={"xl"}
                          className="text-gray-500"
                        />
                      }
                    >
                      <PickupDeliveryCateringContent
                        question={question}
                        callback={fetchQA}
                      />
                    </AccordionItem>
                  );
                })}
            </Accordion>
          )}
          {selectedTab === "Dietary Accommodations" && (
            <Accordion variant="shadow">
              {questions
                .filter((question) => question.type == "dietary_accommodations")
                .map((question, index) => {
                  const title = getTitle(question);
                  const subtitle = getSubtitle(question);
                  const icon = getIcon(title);

                  return (
                    <AccordionItem
                      key={index}
                      aria-label={title}
                      title={title}
                      subtitle={subtitle}
                      indicator={({ isOpen }) => (
                        <FontAwesomeIcon
                          icon={isOpen ? faXmark : faPencil}
                          className="text-gray-500"
                        />
                      )}
                      startContent={
                        <FontAwesomeIcon
                          icon={icon}
                          size={"xl"}
                          className="text-gray-500"
                        />
                      }
                    >
                      <DietaryAccommodationsContent
                        question={question}
                        callback={fetchQA}
                      />
                    </AccordionItem>
                  );
                })}
            </Accordion>
          )}
          {selectedTab === "Other" && (
            <Accordion variant="shadow">
              {questions
                .filter((question) => question.type == "other")
                .map((question, index) => {
                  const title = getTitle(question);
                  const subtitle = getSubtitle(question);
                  const icon = getIcon(title);

                  return (
                    <AccordionItem
                      key={index}
                      aria-label={title}
                      title={title}
                      subtitle={subtitle}
                      indicator={({ isOpen }) => (
                        <FontAwesomeIcon
                          icon={isOpen ? faXmark : faPencil}
                          className="text-gray-500"
                        />
                      )}
                      startContent={
                        <FontAwesomeIcon
                          icon={icon}
                          size={"xl"}
                          className="text-gray-500"
                        />
                      }
                    >
                      <OtherContent question={question} />
                    </AccordionItem>
                  );
                })}
            </Accordion>
          )}
          {selectedTab === "Settings" && (
            <Accordion variant="shadow">
              {questions
                .filter((question) => question.type == "value")
                .map((question, index) => {
                  const title = getTitle(question);
                  const subtitle = getSubtitle(question);
                  const icon = getIcon("Value");

                  return (
                    <AccordionItem
                      key={index}
                      aria-label={title}
                      title={title}
                      subtitle={subtitle}
                      indicator={({ isOpen }) => (
                        <FontAwesomeIcon
                          icon={isOpen ? faXmark : faPencil}
                          className="text-gray-500"
                        />
                      )}
                      startContent={
                        <FontAwesomeIcon
                          icon={icon}
                          size={"xl"}
                          className="text-gray-500"
                        />
                      }
                    >
                      <ValueContent question={question} callback={fetchQA} />
                    </AccordionItem>
                  );
                })}
            </Accordion>
          )}
        </Skeleton>
      </div>
    </div>
  );
};
