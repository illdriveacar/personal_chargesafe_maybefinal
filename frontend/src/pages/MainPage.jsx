import { useState, useEffect, useCallback } from "react";
import styled, { ThemeProvider } from "styled-components";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import Sidebar from "../components/dashboard/Sidebar";

import CallConfirmModal from "../components/emergency/CallConfirmModal";
import EmergencyGuideModal from "../components/emergency/EmergencyGuideModal";
import EmergencyModal from "../components/emergency/EmergencyModal";

import { dashboardTheme } from "../styles/dashboardTheme";

import ChargingHistoryPage from "./ChargingHistoryPage";
import DashboardPage from "./DashboardPage";
import DeviceManagementPage from "./DeviceManagementPage";
import MonitoringPage from "./MonitoringPage";
import NotificationCenterPage from "./NotificationCenterPage";
import SettingsPage from "./SettingsPage";

import { getMe } from "../api/me";
import { listDevices } from "../api/devices";
import {
  listNotifications,
  readNotification,
  readAllNotifications,
} from "../api/notifications"

// 알림 목록을 다시 불러오는 주기 — 대시보드(5초)와 비슷하게 맞춘다
const NOTIFICATION_REFRESH_MS = 10000;

const MainPage = ({ onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [selectedMonitoringDevice, setSelectedMonitoringDevice] = useState(null);
  const [emergencyView, setEmergencyView] = useState(null);
  const [emergencyTemperature, setEmergencyTemperature] = useState(null);
  const [callPreviousView, setCallPreviousView] = useState("main");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [common, setCommon] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [me, deviceList, notificationData] = await Promise.all([
          getMe(),
          listDevices(),
          listNotifications(),
        ]);
        setCommon(me);
        setDevices(deviceList);
        setSelectedDeviceId(deviceList[0]?.deviceId ?? null);
        setNotifications(notificationData.items);
      } catch (error) {
        alert(error.message);
      }
    })();
  }, []);

  // 알림 목록 새로고침. 예전에는 로그인 때 한 번만 불러와서, 대시보드에는 뜨는
  // 새 알림(비상정지·위험 등)이 알림 센터·종 아이콘에는 페이지를 새로 열기 전까지 안 보였다.
  // 주기적으로 도는 요청이라 실패해도 창을 띄우지 않는다 (다음 주기에 다시 시도).
  const refreshNotifications = useCallback(async () => {
    try {
      const notificationData = await listNotifications();
      setNotifications(notificationData.items);
    } catch (error) {
      console.warn("알림 목록 갱신 실패:", error.message);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(refreshNotifications, NOTIFICATION_REFRESH_MS);
    return () => clearInterval(timer);
  }, [refreshNotifications]);

  const reloadDevices = async () => {
    try {
      const [deviceList, me] = await Promise.all([listDevices(), getMe()]);
      setDevices(deviceList);
      setCommon(me);

      setSelectedDeviceId((current) =>
        deviceList.some((device) => device.deviceId === current)
          ? current
          : deviceList[0]?.deviceId ?? null
      );
    } catch (error) {
      alert(error.message);
    }
  };

  // 알림 상태
  const handleToggleSidebar = () => {
    setIsCollapsed((previous) => !previous);
  };

  const handleSelectMenu = (menuId) => {
    setSelectedMenu(menuId);

    // 알림 센터를 여는 순간에는 주기를 기다리지 않고 바로 최신 목록을 가져온다
    if (menuId === "notifications") refreshNotifications();

    if (menuId !== "monitoring") {
      setSelectedMonitoringDevice(null);
    }
  };

  const handleEmergencyOpen = (temperature) => {
    setEmergencyTemperature(
      typeof temperature === "number" ? temperature : null
    );
    setEmergencyView("main");
  };

  const handleNavigateMonitoring = (device) => {
    setSelectedMonitoringDevice(device);
    setSelectedMenu("monitoring");
  };

  const handlePhoneCall = () => {
    if (!common?.guardian) return;
    const phoneNumber =
      common.guardian.phoneNumber.replaceAll(
        "-",
        ""
      );

    window.location.href = `tel:${phoneNumber}`;
  };

  const handleProfileClick = () => {
    setSelectedMenu("settings");
  };

  // 개별 알림 읽음 처리
  const handleReadNotification = async (notificationId) => {
    try {
      await readNotification(notificationId);
      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (error) {
      alert(error.message);
    }
  };

  // 모든 알림 읽음 처리
  const handleReadAllNotifications = async () => {
    try {
      await readAllNotifications();
      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      alert(error.message);
    }
  };

  // 알림 센터 전체보기
  const handleOpenNotificationCenter = () => {
    setSelectedMenu("notifications");
    refreshNotifications();
  };

  const getPageTitle = () => {
    switch (selectedMenu) {
      case "monitoring":
        return "모니터링";

      case "history":
        return "충전 이력";

      case "notifications":
        return "알림 센터";

      case "devices":
        return "기기 관리";

      case "settings":
        return "설정";

      case "dashboard":
      default:
        return "대시보드";
    }
  };

  const renderPageContent = () => {
    switch (selectedMenu) {
      case "dashboard":
        return (
          <DashboardPage
            deviceId={selectedDeviceId}
            onEmergencyClick={handleEmergencyOpen}
          />
        );

      case "monitoring":
        return (
          <MonitoringPage
            deviceId={selectedDeviceId}
            selectedDevice={selectedMonitoringDevice}
          />
        );

      case "history":
        return (
          <ChargingHistoryPage
            deviceId={selectedDeviceId}
          />
        );

      case "notifications":
        return (
          <NotificationCenterPage
            notifications={notifications}
            onReadNotification={
              handleReadNotification
            }
            onReadAllNotifications={
              handleReadAllNotifications
            }
          />
        );

      case "devices":
        return (
          <DeviceManagementPage
            devices={devices}
            onDevicesChanged={reloadDevices}
            onNavigateMonitoring={
              handleNavigateMonitoring
            }
          />
        );

      case "settings":
        return (
          <SettingsPage
            user={common?.user}
            guardian={common?.guardian}
            deviceSerial={common?.deviceId}
            firmware={common?.firmware}
          />
        );

      default:
        return (
          <DashboardPage
            deviceId={selectedDeviceId}
            onEmergencyClick={handleEmergencyOpen}
          />
        );
    }
  };

  return (
    <ThemeProvider theme={dashboardTheme}>
      <Layout>
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={handleToggleSidebar}
          selectedMenu={selectedMenu}
          onSelectMenu={handleSelectMenu}
          deviceId={common?.deviceId}
          chargePercent={
            common?.chargePercent
          }
          chargingStatus={
            common?.chargingStatus
          }
          onEmergencyClick={handleEmergencyOpen}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <Overlay
          $isOpen={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <MainArea $isCollapsed={isCollapsed}>
          <DashboardHeader
            title={getPageTitle()}
            showLiveText={
              selectedMenu === "dashboard"
            }
            user={common?.user}
            onLogout={onLogout}
            onProfileClick={handleProfileClick}
            notifications={notifications}
            onReadNotification={
              handleReadNotification
            }
            onReadAllNotifications={
              handleReadAllNotifications
            }
            onOpenNotificationCenter={
              handleOpenNotificationCenter
            }
            onOpenMobileMenu={
              () => setIsMobileMenuOpen(true)
            }
          />

          <PageContent>
            {renderPageContent()}
          </PageContent>
        </MainArea>

        {emergencyView === "main" && (
          <EmergencyModal
            temperature={emergencyTemperature ?? "-"}
            onClose={() =>
              setEmergencyView(null)
            }
            onCheckDevice={() => {
              setSelectedMenu("devices");
              setEmergencyView(null);
            }}
            onContactGuardian={() => {
              setCallPreviousView("main");
              setEmergencyView("call");
            }}
            onOpenGuide={() => {
              setEmergencyView("guide");
            }}
          />
        )}

        {emergencyView === "guide" && (
          <EmergencyGuideModal
            onBack={() => {
              setEmergencyView("main");
            }}
            onEmergencyCall={() => {
              setCallPreviousView("guide");
              setEmergencyView("call");
            }}
          />
        )}

        {emergencyView === "call" && common?.guardian && (
          <CallConfirmModal
            guardianName={
              common.guardian.name
            }
            relation={
              common.guardian.relation
            }
            phoneNumber={
              common.guardian.phoneNumber
            }
            onCancel={() => {
              setEmergencyView(callPreviousView);
            }}
            onCall={handlePhoneCall}
          />
        )}
      </Layout>
    </ThemeProvider>
  );
};

export default MainPage;

const Layout = styled.div`
  width: 100%;
  min-height: 100vh;
  background: var(--app-background);
  transition: background 0.25s ease;
`;

const Overlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
    position: fixed;
    inset: 0;
    z-index: 90;
    background: #0f172a73;
  }
`;

const MainArea = styled.div`
  width: auto;
  min-height: 100vh;

  margin-left: ${({ $isCollapsed }) =>
    $isCollapsed ? "64px" : "214px"};

  background: var(--app-background);

  transition:
    margin-left 0.3s ease,
    background 0.25s ease;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const PageContent = styled.main`
  width: 100%;
  min-height: calc(100vh - 56px);
`;