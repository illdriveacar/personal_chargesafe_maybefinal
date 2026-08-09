import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { useAppTheme } from "../contexts/AppThemeContext.jsx";

import ChargeModeModal from "../components/settings/ChargeModeModal";
import ProfileCard from "../components/settings/ProfileCard";
import SettingsSection from "../components/settings/SettingsSection";
import SystemInfoCard from "../components/settings/SystemInfoCard";
import TemperatureModal from "../components/settings/TemperatureModal";
import ThemeModeModal from "../components/settings/ThemeModeModal";

import {
  chargeModes,
  settingSectionData,
} from "../data/settingsData";

import { getSettings, updateSettings } from "../api/me";
import { getThemeModeLabel } from "../styles/appThemes";

const SettingsPage = ({ user, guardian, deviceSerial, firmware }) => {
  const { themeMode, setThemeMode } = useAppTheme();

  const [settings, setSettings] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getSettings()
      .then ((data) => {
        if (cancelled) return;
        setSettings(data);
        if (data.themeMode) setThemeMode(data.themeMode);
      })
      .catch((error) => {
        if (!cancelled) alert(error.message);
      });

    return () => {
      cancelled = true;
    };
    // setThemeMode 는 랜더마다 새로 만들어지므로 의존성에 넣지 않음
    // 이 effect 는 화면 진입 시 한 번만 실행되어야 함
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedChargeMode = useMemo(
    () => 
      chargeModes.find((mode) => mode.id === settings?.chargeMode) ?? null,
    [settings]
  );

  const themeModeLabel = getThemeModeLabel(themeMode);

  const saveSettings = async (patch) => {
    const previous = settings;
    setSettings((current) => ({ ...current, ...patch }));

    try {
      const updated = await updateSettings(patch);
      setSettings(updated);
    } catch (error) {
      setSettings(previous);
      alert(error.message);
    }
  };

  const handleToggle = (settingId, nextValue) => {
    saveSettings({ [settingId]: nextValue });
  };

  const handleApplyChargeMode = (modeId) => {
    saveSettings({ chargeMode: modeId });
    setActiveModal(null);
  };

  const handleApplyTemperature = (temperature) => {
    saveSettings({ cutoffTemperature: temperature });
    setActiveModal(null);
  };

  const handleApplyThemeMode = (nextThemeMode) => {
    setThemeMode(nextThemeMode);
    saveSettings({ themeMode: nextThemeMode });
    setActiveModal(null);
  };

  if (!settings) {
    return <PageContainer>설정을 불러오는 중입니다.</PageContainer>;
  }
  
  // 목표 충전량이 80/85/90/100 이 아니면 서버가 chargeMode:null 을 줌
  const chargeModeLabel = selectedChargeMode
    ? selectedChargeMode.name
    : `사용자 지정 (${settings.targetPercent}%)`;

  return (
    <PageContainer>
      {!settings.hasDevice && (
        <NoticeBox>기기를 등록하면 충전·안전 설정을 저장할 수 있습니다.</NoticeBox>
      )}
      <PageGrid>
        <LeftColumn>
          <ProfileCard
            user={user}
            guardian={guardian}
            deviceId={deviceSerial}
          />

          <SystemInfoCard
            chargeMode={chargeModeLabel}
            cutoffTemperature={
              settings.cutoffTemperature
            }
            firmware={firmware}
          />
        </LeftColumn>

        <RightColumn>
          <SettingsSection
            title={settingSectionData.device.title}
            items={settingSectionData.device.items}
            settings={settings}
            chargeModeLabel={
              chargeModeLabel
            }
            themeModeLabel={themeModeLabel}
            onToggle={handleToggle}
            onOpenChargeMode={() =>
              setActiveModal("chargeMode")
            }
          />

          <SettingsSection
            title={
              settingSectionData.notification.title
            }
            items={
              settingSectionData.notification.items
            }
            settings={settings}
            chargeModeLabel={
              chargeModeLabel
            }
            themeModeLabel={themeModeLabel}
            onToggle={handleToggle}
          />

          <SettingsSection
            title={settingSectionData.safety.title}
            items={settingSectionData.safety.items}
            settings={settings}
            chargeModeLabel={
              chargeModeLabel
            }
            themeModeLabel={themeModeLabel}
            onToggle={handleToggle}
            onOpenTemperature={() =>
              setActiveModal("temperature")
            }
          />

          <SettingsSection
            title={
              settingSectionData.accessibility.title
            }
            items={
              settingSectionData.accessibility.items
            }
            settings={settings}
            chargeModeLabel={
              chargeModeLabel
            }
            themeModeLabel={themeModeLabel}
            onToggle={handleToggle}
            onOpenThemeMode={() =>
              setActiveModal("themeMode")
            }
          />
        </RightColumn>
      </PageGrid>

      {activeModal === "chargeMode" && (
        <ChargeModeModal
          key={settings.chargeMode}
          currentMode={settings.chargeMode}
          onClose={() => setActiveModal(null)}
          onApply={handleApplyChargeMode}
        />
      )}

      {activeModal === "temperature" && (
        <TemperatureModal
          key={settings.cutoffTemperature}
          currentTemperature={
            settings.cutoffTemperature
          }
          onClose={() => setActiveModal(null)}
          onApply={handleApplyTemperature}
        />
      )}

      {activeModal === "themeMode" && (
        <ThemeModeModal
          key={themeMode}
          currentThemeMode={themeMode}
          onClose={() => setActiveModal(null)}
          onApply={handleApplyThemeMode}
        />
      )}
    </PageContainer>
  );
};

export default SettingsPage;

const PageContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 56px);
  padding: 22px;
  background: var(--app-background);
  transition: background 0.25s ease;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const NoticeBox = styled.p`
  margin-bottom: 16px;
  padding: 14px 17px;
  border: 1px solid #f1d46c;
  border-radius: 15px;
  color: #8a6100;
  background: #fff9e8;
  font-size: 13px;
  font-weight: 600;
`;

const PageGrid = styled.div`
  display: grid;
  grid-template-columns:
    minmax(285px, 390px)
    minmax(0, 1fr);
  align-items: start;
  gap: 18px;

  @media (max-width: 950px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.aside`
  position: sticky;
  top: 78px;

  @media (max-width: 950px) {
    position: static;
  }
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 0;
`;