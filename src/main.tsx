import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ConfigProvider } from "antd";

const theme = {
  token: {
    colorPrimary: "#381E05",
    colorPrimaryHover: "#4a2506",
    colorPrimaryActive: "#2a1604",
    borderRadius: 8,
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 8,
    },
    Card: {
      borderRadius: 12,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
  },
};
createRoot(document.getElementById("root")!).render(
  <ConfigProvider theme={theme}>
    <App />
  </ConfigProvider>
);
