import { dbUtils } from "../utils/db.js";
import { db } from "../firebase.js";
import {
  findMaxCoincidingCalls,
  getInitialChartData,
  getUpdatedChartData,
  getFirestoreRanges,
  formatPercentage,
  isTimeInRange,
  getTopicIndex,
  datesTypes,
  hoursTypes,
  isInRange,
} from "../utils/analytics.js";

export const analyticsController = {
  getAnalytics: async (req, reply) => {
    try {
      const { dates, hours } = req.query;

      if (!datesTypes.includes(dates) || !hoursTypes.includes(hours)) {
        return reply.code(400).send({ error: "Invalid params" });
      }

      const { prevPeriodStart, currentPeriodStart, currentPeriodEnd } =
        getFirestoreRanges(dates);

      const jsCurrentStart = dbUtils.parseDBTimestamp(currentPeriodStart);
      const jsCurrentEnd = dbUtils.parseDBTimestamp(currentPeriodEnd);

      const data = {
        totalTime: 0,
        coincidingCalls: 0,
        satisfaction: 0,
        totalCalls: 0,
        inboundCallsData: getInitialChartData(jsCurrentStart, jsCurrentEnd),
        duringVsAfterHours: {
          title: "Number of calls",
          labels: ["During Hours:", "After Hours:"],
          data: [0, 0],
        },
        callTopics: {
          title: "Number of calls",
          labels: [
            "Reservations:",
            "Address:",
            "Pickup:",
            "Delivery:",
            "Catering:",
            "Dietary:",
            "Other:",
          ],
          data: [0, 0, 0, 0, 0, 0, 0],
        },
        newVsRepeat: {
          title: "Number of calls",
          labels: ["Repeat Callers:", "New Callers:"],
          data: [0, 0],
        },
        conversationBreakdown: {
          title: "Number of calls",
          labels: [
            "Fully automated:",
            "Forwarded due to unmatched questions:",
            "Forwarded due to order issues:",
            "Forwarded due to request:",
            "Forwarded due to other reasons:",
          ],
          data: [0, 0, 0, 0, 0],
        },
        transferredCalls: getInitialChartData(jsCurrentStart, jsCurrentEnd),
        smsSent: 0,
        optInRate: 0,
        callToSentRatio: 0,
        change: {
          totalTime: 0,
          coincidingCalls: 0,
          satisfaction: 0,
          totalCalls: 0,
          smsSent: 0,
          optInRate: 0,
          callToSentRatio: 0,
        },
      };

      const coincidingCallsCurrent = [];
      const coincidingCallsPrevious = [];
      let smsOfferedCurrent = 0;
      let smsOfferedPrevious = 0;

      const previous = {
        totalTime: 0,
        coincidingCalls: 0,
        satisfaction: 0,
        totalCalls: 0,
        smsSent: 0,
        optInRate: 0,
        callToSentRatio: 0,
        totalForwarded: 0,
      };

      const snapshot = await db
        .collection("calls")
        .where("date", ">=", prevPeriodStart)
        .where("date", "<=", currentPeriodEnd)
        .get();

      if (snapshot.docs.length == 0) {
        return reply.send(data);
      }

      const callersSnapshot = await db
        .collection("callers")
        .doc("callers")
        .get();
      const callers = callersSnapshot.data().callers;

      for (let i = 0; i < snapshot.docs.length; i++) {
        const doc = snapshot.docs[i].data();
        doc.id = snapshot.docs[i].id;

        const jsCallStartTime = dbUtils.parseDBTimestamp(doc.startTime);
        const jsCallEndTime = dbUtils.parseDBTimestamp(doc.endTime);

        if (!isTimeInRange(hours, jsCallStartTime)) {
          continue;
        }

        if (isInRange(jsCurrentStart, jsCurrentEnd, jsCallStartTime)) {
          //Current period
          data.totalTime += doc.duration;
          coincidingCallsCurrent.push({
            startTime: jsCallStartTime,
            endTime: jsCallEndTime,
          });
          data.totalCalls++;
          const updatedInbound = getUpdatedChartData(
            jsCurrentStart,
            jsCurrentEnd,
            data.inboundCallsData,
            jsCallStartTime,
            true
          );
          data.inboundCallsData = updatedInbound;

          if (
            isTimeInRange("12PM - 6PM", jsCallStartTime) ||
            isTimeInRange("6PM - 9PM", jsCallStartTime)
          ) {
            data.duringVsAfterHours.data[0]++;
          } else {
            data.duringVsAfterHours.data[1]++;
          }

          if (doc.topicsCovered && doc.topicsCovered.length > 0) {
            doc.topicsCovered.forEach((topic) => {
              data.callTopics.data[getTopicIndex(topic)]++;
            });
          }

          if (doc.forwarded && doc.forwarded.wasForwarded) {
            const updatedTransferred = getUpdatedChartData(
              jsCurrentStart,
              jsCurrentEnd,
              data.transferredCalls,
              jsCallStartTime,
              true
            );
            data.transferredCalls = updatedTransferred;
            if (doc.forwarded.forwardReason == "unmatched_question") {
              data.conversationBreakdown.data[1]++;
            } else if (doc.forwarded.forwardReason == "order_issues") {
              data.conversationBreakdown.data[2]++;
            } else if (doc.forwarded.forwardReason == "talk_to_human") {
              data.conversationBreakdown.data[3]++;
            } else if (doc.forwarded.forwardReason == "other") {
              data.conversationBreakdown.data[4]++;
            }
          } else {
            data.conversationBreakdown.data[0]++;
          }

          if (doc.sms && doc.sms.length > 0) {
            doc.sms.forEach((sms) => {
              if (sms.offered) {
                smsOfferedCurrent++;
              }

              if (sms.sent) {
                data.smsSent++;
              }
            });
          }

          if (
            callers.find(
              (caller) =>
                caller.callerNumber === doc.callerNumber &&
                caller.latestCallId != doc.id
            )
          ) {
            data.newVsRepeat.data[0]++;
          } else {
            data.newVsRepeat.data[1]++;
          }
        } else if (dates != "All Time") {
          //Previous period
          previous.totalTime += doc.duration;
          coincidingCallsPrevious.push({
            startTime: jsCallStartTime,
            endTime: jsCallEndTime,
          });
          previous.totalCalls++;
          const updatedInbound = getUpdatedChartData(
            jsCurrentStart,
            jsCurrentEnd,
            data.inboundCallsData,
            jsCallStartTime,
            false
          );
          data.inboundCallsData = updatedInbound;
          if (doc.forwarded && doc.forwarded.wasForwarded) {
            const updatedTransferred = getUpdatedChartData(
              jsCurrentStart,
              jsCurrentEnd,
              data.transferredCalls,
              jsCallStartTime,
              false
            );
            data.transferredCalls = updatedTransferred;
            previous.totalForwarded++;
          }

          if (doc.sms && doc.sms.length > 0) {
            doc.sms.forEach((sms) => {
              if (sms.offered) {
                smsOfferedPrevious++;
              }

              if (sms.sent) {
                previous.smsSent++;
              }
            });
          }
        }
      }

      data.coincidingCalls = findMaxCoincidingCalls(coincidingCallsCurrent);
      previous.coincidingCalls = findMaxCoincidingCalls(
        coincidingCallsPrevious
      );

      const duringHours = data.duringVsAfterHours.data[0];
      const totalCalls = data.totalCalls;
      const duringPercentage =
        totalCalls == 0
          ? 0
          : Number(((duringHours / totalCalls) * 100).toFixed(2));
      data.duringVsAfterHours.labels[0] += formatPercentage(duringPercentage);
      data.duringVsAfterHours.labels[1] += formatPercentage(
        100 - duringPercentage
      );

      const totalTopicsCovered = data.callTopics.data.reduce(
        (acc, val) => acc + val,
        0
      );
      for (let i = 0; i < data.callTopics.data.length; i++) {
        const percentage =
          totalTopicsCovered == 0
            ? 0
            : Number(
                ((data.callTopics.data[i] / totalTopicsCovered) * 100).toFixed(
                  2
                )
              );
        data.callTopics.labels[i] += formatPercentage(percentage);
      }

      data.optInRate =
        smsOfferedCurrent == 0
          ? 0
          : Number(((data.smsSent / smsOfferedCurrent) * 100).toFixed(2));
      previous.optInRate =
        smsOfferedPrevious == 0
          ? 0
          : Number(((previous.smsSent / smsOfferedPrevious) * 100).toFixed(2));

      const repeatCallersPercentage =
        totalCalls == 0
          ? 0
          : Number(((data.newVsRepeat.data[0] / totalCalls) * 100).toFixed(2));
      data.newVsRepeat.labels[0] += formatPercentage(repeatCallersPercentage);
      data.newVsRepeat.labels[1] += formatPercentage(
        100 - repeatCallersPercentage
      );

      data.callToSentRatio =
        data.smsSent == 0
          ? 0
          : Number((data.totalCalls / data.smsSent).toFixed(2));

      previous.callToSentRatio =
        previous.smsSent == 0
          ? 0
          : Number((previous.totalCalls / previous.smsSent).toFixed(2));

      for (let i = 1; i < data.conversationBreakdown.data.length; i++) {
        const percentage =
          data.totalCalls == 0
            ? 0
            : Number(
                (
                  (data.conversationBreakdown.data[i] / data.totalCalls) *
                  100
                ).toFixed(2)
              );
        data.conversationBreakdown.labels[i] += formatPercentage(percentage);
      }
      const fullyAutomatedPercentage =
        data.totalCalls == 0
          ? 0
          : Number(
              (
                (data.conversationBreakdown.data[0] / data.totalCalls) *
                100
              ).toFixed(2)
            );
      data.conversationBreakdown.labels[0] += formatPercentage(
        fullyAutomatedPercentage
      );
      data.satisfaction = fullyAutomatedPercentage;

      previous.satisfaction =
        previous.totalCalls == 0
          ? 0
          : Number(
              (
                100 -
                (previous.totalForwarded / previous.totalCalls) * 100
              ).toFixed(2)
            );

      if (dates != "All Time") {
        data.change = {
          totalTime: data.totalTime - previous.totalTime,
          coincidingCalls: data.coincidingCalls - previous.coincidingCalls,
          satisfaction: Number(
            (data.satisfaction - previous.satisfaction).toFixed(2)
          ),
          totalCalls: data.totalCalls - previous.totalCalls,
          smsSent: data.smsSent - previous.smsSent,
          optInRate: Number((data.optInRate - previous.optInRate).toFixed(2)),
          callToSentRatio: Number(
            (data.callToSentRatio - previous.callToSentRatio).toFixed(2)
          ),
        };
      }

      reply.send(data);
    } catch (error) {
      console.error("An error occurred:", error);
      reply.code(500).send({ error: "An error occurred" });
    }
  },
};
