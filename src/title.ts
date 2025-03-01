import * as echarts from "echarts";
import "./style.css";

const chartElt = htmlNode.querySelector<HTMLDivElement>("#chart-container");

if (!chartElt) {
  throw new Error("No chart element found");
}

// Initialize ECharts instance
const chart = echarts.init(chartElt);

function GrafanaPanel() {
  const option = {
    graphic: {
      elements: [
        {
          type: "text",
          left: "center",
          top: "center",
          style: {
            text: "Grafana Custom Visualization using Echarts",
            fontSize: 50,
            fontWeight: "bold",
            fontFamily: "DMDisplay, sans-serif",
            lineDash: [0, 200],
            lineDashOffset: 0,
            fill: "transparent",
            stroke: "#000",
            lineWidth: 1,
          },
          keyframeAnimation: {
            duration: 3000,
            loop: false,
            keyframes: [
              {
                percent: 0.7,
                style: {
                  fill: "transparent",
                  lineDashOffset: 200,
                  lineDash: [200, 0],
                },
              },
              {
                // Stop for a while.
                percent: 0.8,
                style: {
                  fill: "transparent",
                },
              },
              {
                percent: 1,
                style: {
                  fill: "black",
                },
              },
            ],
          },
        },
      ],
    },
  };

  chart.setOption(option);
}

htmlNode.addEventListener("panelupdate", GrafanaPanel);
