import { useState, useEffect } from "react";
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

const MainPage = ({ onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [selectedMonitoringDevice, setSelectedMonitoringDevice] = useState(null);
  const [emergencyView, setEmergencyView] = useState(null);
  const [emergencyTemperature, setEmergencyTemperature] = useState(null);
  const [callPreviousView, setCallPreviousView] = useState("main");

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

const MainArea = styled.div`
  width: auto;
  min-height: 100vh;

  margin-left: ${({ $isCollapsed }) =>
    $isCollapsed ? "64px" : "214px"};

  background: var(--app-background);

  transition:
    margin-left 0.3s ease,
    background 0.25s ease;
`;

const PageContent = styled.main`
  width: 100%;
  min-height: calc(100vh - 56px);
`;