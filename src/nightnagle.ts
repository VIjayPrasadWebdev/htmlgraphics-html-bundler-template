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
  window.process = window.process ?? {
    env: { NODE_ENV: "production" },
  };
}

import * as echarts from "echarts";
import "./style.css";

// Select the chart container
const chartElt = htmlNode.querySelector<HTMLDivElement>("#chart-container");

if (!chartElt) {
  throw new Error("No chart element found");
}

// Initialize ECharts
const chart = echarts.init(chartElt, "dark"); // Set dark theme

// Panel update event listener
function onPanelUpdate() {
  if (!data || !data.series || data.series.length === 0) {
    console.error("Invalid data format received from API");
    return;
  }

  // Extract Prices (Numbers) & Product Names (Strings) from API
  const prices: any = data.series[0].fields[0]?.values || [];
  const productNames: any = data.series[0].fields[1]?.values || [];

  console.log("Prices:", prices);
  console.log("Product Names:", productNames);

  // Ensure valid array lengths
  if (prices.length !== productNames.length) {
    console.error(
      "Data length mismatch: Prices and Product Names must have the same count"
    );
    return;
  }

  // Transform API Data
  const transformedData = prices.map((price: number, index: number) => ({
    value: price ?? 0, // Default to 0 if undefined
    name: productNames[index] ?? "Unknown", // Default to "Unknown" if missing
  }));

  console.log("Transformed Data:", transformedData);

  // Update ECharts with API Data
  chart.setOption({
    backgroundColor: "transparent",
    title: {
      textStyle: {
        color: "#fff", // Ensure visibility in dark mode
      },
    },
    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      bottom: "0%",
      textStyle: {
        color: "#fff", // Ensure visibility in dark mode
      },
    },
    series: [
      {
        name: "Products",
        type: "pie",
        radius: [50, 200],
        center: ["50%", "50%"],
        roseType: "area",
        itemStyle: {
          borderRadius: 8,
        },
        label: {
          color: "#fff", // Ensure visibility in dark mode
        },
        data: transformedData,
      },
    ],
  });
}

// Listen for Grafana panel updates
htmlNode.addEventListener("panelupdate", onPanelUpdate);
