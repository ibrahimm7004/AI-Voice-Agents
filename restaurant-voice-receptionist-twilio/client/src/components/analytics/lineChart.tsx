import { LineChartData } from "../../types/lineChartData";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";

export const LineChart = ({ chartData }: { chartData: LineChartData }) => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false,
      },
    },
    scales: {
      current: {
        type: "linear" as const,
        display: false,
      },
      previous: {
        type: "linear" as const,
        display: false,
      },
      x: {
        display: true,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    elements: {
      point: { pointStyle: false as const },
      line: { cubicInterpolationMode: "monotone" as const },
    },
  };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Current",
        data: chartData.currentData,
        borderColor: "#f31260",
        backgroundColor: "#f31260",
        yAxisID: "current",
      },
      {
        label: "Previous",
        data: chartData.previousData,
        borderColor: "#f3126022",
        backgroundColor: "#f3126022",
        yAxisID: "previous",
      },
    ],
  };

  return (
    <div className="relative h-full w-full">
      <Line options={options} data={data} />
    </div>
  );
};
