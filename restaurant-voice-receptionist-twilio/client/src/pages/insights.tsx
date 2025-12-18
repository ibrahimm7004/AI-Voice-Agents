import { AnalyticsCardFooter } from "../components/analytics/cardFooter";
import { DoughnutChart } from "../components/analytics/doughnutChart";
import { formatDuration, formatPercentage } from "../utils/string";
import { LineChart } from "../components/analytics/lineChart";
import { AnalyticsCard } from "../components/analytics/card";
import { BarChart } from "../components/analytics/barChart";
import { AnalyticsHours } from "../types/analyticsHours";
import { AnalyticsDates } from "../types/analyticsDates";
import { Analytics } from "../types/analytics";
import { useEffect, useState } from "react";
import {
  AnalyticsHeader,
  AnalyticsHeaderWithOptions,
} from "../components/analytics/header";
import { toast } from "react-toastify";
import api from "../utils/api";

export const Insights = () => {
  const [selectedHours, setSelectedHours] = useState<AnalyticsHours>("All");
  const [selectedDates, setSelectedDates] =
    useState<AnalyticsDates>("This Week");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    const getAnalyticsData = async () => {
      setIsLoading(true);

      try {
        const { response, data } = await api.get(
          `analytics?dates=${encodeURIComponent(
            selectedDates
          )}&hours=${encodeURIComponent(selectedHours)}`
        );

        if (!response.ok) {
          throw new Error();
        }

        setData(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch questions");
      }

      setIsLoading(false);
    };

    getAnalyticsData();
  }, [selectedDates, selectedHours]);

  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-gray-100 flex flex-col gap-2 flex-1 w-full overflow-y-auto">
        <h1 className="text-3xl font-light text-black font-bebas tracking-wide">
          Insights
        </h1>

        <AnalyticsHeaderWithOptions
          label="Overview"
          selectedDates={selectedDates}
          selectedHours={selectedHours}
          onDatesChange={setSelectedDates}
          onHoursChange={setSelectedHours}
        />

        <div className="flex flex-row mt-7 gap-8 flex-wrap">
          <AnalyticsCard
            isLoading={isLoading}
            className="w-single3"
            heading="Time Unlocked"
            content={
              <span className="font-extrabold text-2xl">
                {!data ? "4h 8m" : formatDuration(data.totalTime)}
              </span>
            }
            footer={
              data && data.change.totalTime == 0 ? null : (
                <AnalyticsCardFooter
                  change={!data ? 20 : data.change.totalTime}
                  type="time"
                />
              )
            }
          />
          <AnalyticsCard
            isLoading={isLoading}
            heading="Coinciding Calls"
            className="w-single3"
            content={
              <span className="font-extrabold text-2xl">
                {!data ? "4h 8m" : data.coincidingCalls}
              </span>
            }
            footer={
              data && data.change.coincidingCalls == 0 ? null : (
                <AnalyticsCardFooter
                  change={!data ? 20 : data.change.coincidingCalls}
                />
              )
            }
          />
          <AnalyticsCard
            isLoading={isLoading}
            heading="Customer Satisfaction"
            className="w-single3"
            content={
              <span className="font-extrabold text-2xl">
                {!data ? "4h 8m" : Math.floor(data.satisfaction)}
              </span>
            }
            footer={
              data && data.change.satisfaction == 0 ? null : (
                <AnalyticsCardFooter
                  change={!data ? 20 : data.change.satisfaction}
                  type="percentage"
                />
              )
            }
          />
          <AnalyticsCard
            isLoading={isLoading}
            heading="Total Inbound Calls"
            className="w-single3"
            content={
              <span className="font-extrabold text-2xl">
                {!data ? "4h 8m" : data.totalCalls}
              </span>
            }
            footer={
              data && data.change.totalCalls == 0 ? null : (
                <AnalyticsCardFooter
                  change={!data ? 20 : data.change.totalCalls}
                />
              )
            }
          />
          <AnalyticsCard
            isLoading={isLoading}
            heading="Total Inbound Calls"
            className="w-double"
            content={
              isLoading || !data ? (
                <span className="font-extrabold text-2xl">4h 8m</span>
              ) : (
                <LineChart chartData={data.inboundCallsData} />
              )
            }
          />
          <AnalyticsCard
            isLoading={isLoading}
            heading="During vs After Hours"
            className="w-half"
            content={
              isLoading || !data ? (
                <span className="font-extrabold text-2xl">4h 8m</span>
              ) : (
                <DoughnutChart chartData={data.duringVsAfterHours} />
              )
            }
          />
          <AnalyticsCard
            isLoading={isLoading}
            heading="Call Topics"
            className="w-half"
            content={
              isLoading || !data ? (
                <span className="font-extrabold text-2xl">4h 8m</span>
              ) : (
                <DoughnutChart chartData={data.callTopics} />
              )
            }
          />
        </div>

        <AnalyticsHeader label="Conversation Breakdown" />

        <div className="flex flex-row mt-7 gap-8 flex-wrap">
          <AnalyticsCard
            isLoading={isLoading}
            heading="New vs Returning Customers"
            className="w-half"
            content={
              isLoading || !data ? (
                <span className="font-extrabold text-2xl">4h 8m</span>
              ) : (
                <DoughnutChart chartData={data.newVsRepeat} />
              )
            }
          />
          <AnalyticsCard
            isLoading={isLoading}
            heading="Conversation Breakdown"
            className="w-half"
            content={
              isLoading || !data ? (
                <span className="font-extrabold text-2xl">4h 8m</span>
              ) : (
                <DoughnutChart chartData={data.conversationBreakdown} />
              )
            }
          />
          <AnalyticsCard
            isLoading={isLoading}
            heading="Transferred Calls by Hour"
            className="w-full"
            content={
              isLoading || !data ? (
                <span className="font-extrabold text-2xl">4h 8m</span>
              ) : (
                <BarChart chartData={data.transferredCalls} />
              )
            }
          />
        </div>

        <AnalyticsHeader label="SMS Breakdown" />

        <div className="flex flex-row mt-7 gap-8 flex-wrap">
          <AnalyticsCard
            isLoading={isLoading}
            className="w-single3"
            heading="Sent"
            content={
              <span className="font-extrabold text-2xl">
                {!data ? "4h 8m" : data.smsSent}
              </span>
            }
            footer={
              data && data.change.smsSent == 0 ? null : (
                <AnalyticsCardFooter
                  change={!data ? 20 : data.change.smsSent}
                />
              )
            }
          />
          <AnalyticsCard
            isLoading={isLoading}
            heading="Opt-in Rate"
            className="w-single3"
            content={
              <span className="font-extrabold text-2xl">
                {!data ? "4h 8m" : formatPercentage(data.optInRate)}
              </span>
            }
            footer={
              data && data.change.optInRate == 0 ? null : (
                <AnalyticsCardFooter
                  change={!data ? 20 : data.change.optInRate}
                  type="percentage"
                />
              )
            }
          />
          <AnalyticsCard
            isLoading={isLoading}
            heading="Call to Sent Ratio"
            className="w-single3"
            content={
              <span className="font-extrabold text-2xl">
                {!data ? "4h 8m" : formatPercentage(data.callToSentRatio)}
              </span>
            }
            footer={
              data && data.change.callToSentRatio == 0 ? null : (
                <AnalyticsCardFooter
                  change={!data ? 20 : data.change.callToSentRatio}
                  type="percentage"
                />
              )
            }
          />
        </div>
      </div>
    </div>
  );
};
