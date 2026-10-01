import {
  Bell,
  CheckCircle2,
  CircleAlert,
  TriangleAlert,
} from "lucide-react";

// 알림 종류별 아이콘·색 — 종 아이콘 목록(NotificationDropdownItem)과 새 알림 팝업(NotificationToast)이 함께 쓴다
export const typeConfig = {
  danger: {
    icon: TriangleAlert,
    color: "#ef5c60",
    background: "#fff0f0",
  },

  warning: {
    icon: CircleAlert,
    color: "#e9a914",
    background: "#fff8df",
  },

  success: {
    icon: CheckCircle2,
    color: "#72bf7c",
    background: "#effbf1",
  },

  info: {
    icon: Bell,
    color: "#6f8df7",
    background: "#eef3ff",
  },
};
