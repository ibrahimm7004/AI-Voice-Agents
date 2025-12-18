import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { DoughnutChartData } from "../../types/doughnutChartData";
import { Doughnut } from "react-chartjs-2";

export const DoughnutChart = ({
  chartData,
}: {
  chartData: DoughnutChartData;
}) => {
  ChartJS.register(ArcElement, Tooltip, Legend);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        displayColors: false,
        callbacks: {
          title: function (): string | void | string[] {
            return "";
          },
        },
      },
    },
  };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: chartData.title,
        data: chartData.data,
        backgroundColor: [
          "#f3126099",
          "#f5a52499",
          "#006FEE99",
          "#9353d399",
          "#17c96499",
          "#fdd0df99",
          "#fbdba799",
        ],
        borderColor: ["#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF"],
        borderWidth: 4,
      },
    ],
  };

  return (
    <div className="relative h-full w-full">
      <Doughnut options={options} data={data} />
    </div>
  );
};
