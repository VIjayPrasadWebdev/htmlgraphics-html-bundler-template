declare global {
  interface Window {
    process?: {
      env: {
        NODE_ENV: string;
      };
    };
  }
}

// Ensure process.env exists (for compatibility)
if (typeof window !== "undefined") {
  window.process = window.process ?? { env: { NODE_ENV: "production" } };
}

import * as echarts from "echarts";
import "./style.css";

// Select the chart container
const chartElt: any =
  htmlNode?.querySelector<HTMLDivElement>("#chart-container");

if (!chartElt) {
  throw new Error("No chart element found");
}

// Initialize ECharts
const chart: any = echarts.init(chartElt, "dark"); // Set dark theme

// Default color palette
const defaultPalette: any = [
  "#5470c6",
  "#91cc75",
  "#fac858",
  "#ee6666",
  "#73c0de",
  "#3ba272",
  "#fc8452",
  "#9a60b4",
  "#ea7ccc",
];

// Define radius range
const radius: any = ["30%", "80%"];

// Initialize empty transformedData
let transformedData: any = [];

// Pie Chart Configuration (Initially Empty)
const pieOption: any = {
  series: [
    {
      type: "pie",
      id: "distribution",
      radius: radius,
      label: { show: false },
      universalTransition: true,
      animationDurationUpdate: 1000,
      data: [],
    },
  ],
};

// Parliament Layout Calculation Function
const parliamentLayout = (
  startAngle: number,
  endAngle: number,
  totalAngle: number,
  r0: number,
  r1: number,
  size: number
) => {
  const rowsCount = Math.ceil((r1 - r0) / size);
  const points = [];
  let r = r0;

  for (let i = 0; i < rowsCount; i++) {
    const totalRingSeatsNumber = Math.round((totalAngle * r) / size);
    const newSize = (totalAngle * r) / totalRingSeatsNumber;

    for (
      let k = Math.floor((startAngle * r) / newSize) * newSize;
      k < Math.floor((endAngle * r) / newSize) * newSize - 1e-6;
      k += newSize
    ) {
      const angle = k / r;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      points.push([x, y]);
    }

    r += size;
  }

  return points;
};

// Parliament Chart Configuration
const parliamentOption: any = {
  series: [
    {
      type: "custom",
      id: "distribution",
      data: [],
      coordinateSystem: undefined,
      universalTransition: true,
      animationDurationUpdate: 1000,
      renderItem: (params: any, api: any) => {
        const idx: number = params.dataIndex;
        const viewSize: number = Math.min(api.getWidth(), api.getHeight());
        const r0: number = ((parseFloat(radius[0]) / 100) * viewSize) / 2;
        const r1: number = ((parseFloat(radius[1]) / 100) * viewSize) / 2;
        const cx: number = api.getWidth() * 0.5;
        const cy: number = api.getHeight() * 0.5;
        const size: number = viewSize / 50;

        if (!transformedData || transformedData.length === 0) {
          return { type: "group", children: [] };
        }

        const sum = transformedData.reduce(
          (sum: number, cur: any) => sum + cur.value,
          0
        );
        const angles: number[] = [];
        const startAngle = -Math.PI / 2;
        let curAngle = startAngle;

        transformedData.forEach((item: any) => {
          angles.push(curAngle);
          curAngle += (item.value / sum) * Math.PI * 2;
        });

        angles.push(startAngle + Math.PI * 2);

        const points = parliamentLayout(
          angles[idx],
          angles[idx + 1],
          Math.PI * 2,
          r0,
          r1,
          size + 3
        );

        return {
          type: "group",
          children: points.map((pt: any) => ({
            type: "circle",
            autoBatch: true,
            shape: {
              cx: cx + pt[0],
              cy: cy + pt[1],
              r: size / 2,
            },
            style: {
              fill: defaultPalette[idx % defaultPalette.length],
            },
          })),
        };
      },
    },
  ],
};

// Function to update the chart when data arrives
const onPanelUpdate = () => {
  // Extract data from event
  if (!data || !data.series) {
    console.error("Invalid data format received from API");
    return;
  }

  // Extract Prices & Product Names from API
  const prices: any = data.series[0].fields[0]?.values || [];
  const productNames: any = data.series[0].fields[1]?.values || [];

  if (prices.length !== productNames.length) {
    console.error(
      "Data length mismatch: Prices and Product Names must have the same count"
    );
    return;
  }

  // Transform API Data
  transformedData = prices.map((price: any, index: any) => ({
    value: price ?? 0,
    name: productNames[index] ?? "Unknown",
  }));

  console.log("Transformed Data:", transformedData);

  // Ensure `series` exists before modifying
  if (!Array.isArray(pieOption.series) || pieOption.series.length === 0) {
    console.error("Pie chart series structure is invalid.");
    return;
  }
  if (
    !Array.isArray(parliamentOption.series) ||
    parliamentOption.series.length === 0
  ) {
    console.error("Parliament chart series structure is invalid.");
    return;
  }

  // ✅ Now we can safely update `series`
  pieOption.series = [{ ...pieOption.series[0], data: transformedData }];
  parliamentOption.series = [
    { ...parliamentOption.series[0], data: transformedData },
  ];

  // Set the initial option (Pie Chart)
  chart.setOption(pieOption);
};

// Listen for Grafana panel updates
const eventTarget: any = htmlNode || document;
eventTarget.addEventListener("panelupdate", onPanelUpdate);

// Set initial chart option (empty until API data arrives)
chart.setOption(pieOption);

setInterval(() => {
  if (transformedData.length > 0) {
    const currentOption: any = chart.getOption();
    const currentSeries: any = currentOption.series || [];

    if (!currentSeries.length) return;

    const isPieChart: any = currentSeries[0]?.type === "pie";
    const newOption: any = isPieChart ? parliamentOption : pieOption;

    chart.setOption(newOption, true);
  }
}, 2000);
