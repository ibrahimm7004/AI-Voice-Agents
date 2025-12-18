import { BarChartData } from "./barChartData";
import { DoughnutChartData } from "./doughnutChartData";
import { LineChartData } from "./lineChartData";

export interface Analytics {
  totalTime: number;
  coincidingCalls: number;
  satisfaction: number;
  totalCalls: number;
  inboundCallsData: LineChartData;
  duringVsAfterHours: DoughnutChartData;
  callTopics: DoughnutChartData;
  newVsRepeat: DoughnutChartData;
  conversationBreakdown: DoughnutChartData;
  transferredCalls: BarChartData;
  smsSent: number;
  optInRate: number;
  callToSentRatio: number;
  change: changeAnalytics;
}

export interface changeAnalytics {
  totalTime: number;
  coincidingCalls: number;
  satisfaction: number;
  totalCalls: number;
  smsSent: number;
  optInRate: number;
  callToSentRatio: number;
}
