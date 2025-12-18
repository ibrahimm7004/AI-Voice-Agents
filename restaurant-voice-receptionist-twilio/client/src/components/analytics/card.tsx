import { cn } from "../../utils/cn";
import {
  CardFooter,
  CardHeader,
  CardBody,
  Skeleton,
  Divider,
  Card,
} from "@nextui-org/react";

export const AnalyticsCard = ({
  isLoading,
  className,
  bodyClassName,
  heading,
  content,
  footer,
}: {
  isLoading: boolean;
  className?: string;
  bodyClassName?: string;
  heading: string;
  content: React.ReactNode;
  footer?: React.ReactNode;
}) => {
  return (
    <Card className={cn(className, "min-h-60")}>
      <CardHeader>
        <p className="text-md text-gray-700">{heading}</p>
      </CardHeader>
      <Divider />
      <CardBody
        className={cn("flex items-center justify-center h-36", bodyClassName)}
      >
        <Skeleton
          className={cn("rounded-lg", !isLoading ? "w-full h-full" : "")}
          classNames={
            isLoading
              ? undefined
              : {
                  content: " w-full h-full flex items-center justify-center",
                }
          }
          isLoaded={!isLoading}
        >
          {content}
        </Skeleton>
      </CardBody>
      {footer && (
        <>
          <Divider />
          <CardFooter className="flex items-center justify-center">
            <Skeleton className="rounded-lg" isLoaded={!isLoading}>
              {footer}
            </Skeleton>
          </CardFooter>
        </>
      )}
    </Card>
  );
};
