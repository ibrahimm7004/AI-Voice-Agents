import { BarChartData } from "../../types/barChartData";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";

export const BarChart = ({ chartData }: { chartData: BarChartData }) => {
  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

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
        callbacks: {
          title: function (): string | void | string[] {
            return "";
          },
        },
      },
    },
    scales: {
      y: {
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
        label: chartData.title,
        data: chartData.data,
        borderColor: "#f31260AA",
        backgroundColor: "#f31260AA",
      },
    ],
  };

  return (
    <div className="relative h-full w-full">
      <Bar options={options} data={data} />
    </div>
  );
};
