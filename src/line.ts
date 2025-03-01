declare global {
  interface Window {
    process?: {
      env: {
        NODE_ENV: string;
      };
    };
  }
}

if (typeof window !== "undefined") {
  window.process = window.process ?? {
    env: { NODE_ENV: "production" },
  };
}

import * as echarts from "echarts";
import "./style.css";

const chartElt = htmlNode.querySelector<HTMLDivElement>("#chart-container");

if (!chartElt) {
  throw new Error("No chart element found");
}

// Initialize ECharts instance
const chart = echarts.init(chartElt);

function onPanelUpdate() {
  if (!data || !data.series) {
    console.error("Invalid data format received from API");
    return;
  }

  // Extract Prices (Numbers) & Product Names (Strings) from API
  const prices: any = data.series[0].fields[0]?.values ?? []; // Assuming first field contains prices
  const productNames: any = data.series[0].fields[1]?.values ?? []; // Assuming second field contains names

  console.log(prices, productNames);

  if (prices.length !== productNames.length) {
    console.error(
      "Data length mismatch: Prices and Product Names must have the same count"
    );
    return;
  }

  // Transform API Data Using Reduce
  const transformedData: any = prices.reduce(
    (acc: any, price: any, index: any) => {
      acc.labels.push(productNames[index]);
      acc.values.push(price);
      return acc;
    },
    { labels: [], values: [] }
  );

  // Update ECharts with API Data
  chart.setOption({
    title: {
      text: "Product Prices",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: transformedData.labels,
      axisLabel: {
        rotate: 45, // Rotate labels for better readability
        fontSize: 12,
        interval: 0, // Show all labels
      },
    },
    yAxis: {
      type: "value",
      name: "Price ($)",
    },
    series: [
      {
        name: "Price",
        type: "line",
        data: transformedData.values,
      },
    ],
  });
}

// Listen for Grafana panel updates
htmlNode.addEventListener("panelupdate", onPanelUpdate);
