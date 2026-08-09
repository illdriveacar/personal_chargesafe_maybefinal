import { useState } from "react";
import styled from "styled-components";
import { Plus } from "lucide-react";

import AddDeviceModal from "../components/device/AddDeviceModal";
import DeviceList from "../components/device/DeviceList";
import DeviceSettingsModal from "../components/device/DeviceSettingsModal";
import DeviceStatsSection from "../components/device/DeviceStatsSection";

import {
  listDiscoverable,
  connectDevice,
  updateDevice,
  removeDevice,
  requestFirmwareUpdate,
  acceptInvite,
  createInvite,
} from "../api/devices";

const DeviceManagementPage = ({
  devices = [],
  onDevicesChanged,
  onNavigateMonitoring,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [settingsDevice, setSettingsDevice] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);

  const handleOpenAddModal = async () => {
    setIsAddModalOpen(true);

    try {
      setAvailableDevices(await listDiscoverable());
    } catch (error) {
      alert(error.message);
    }
  };


  const handleConnectDevice = async (device) => {
    try {
      await connectDevice(device.id);
      await onDevicesChanged?.();
      setIsAddModalOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    const targetDevice = devices.find(
      (device) => device.id === deviceId
    );

    const shouldDelete = window.confirm(
      `${targetDevice?.name ?? "이 기기"}를 삭제하시겠습니까?`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await removeDevice(deviceId);
      await onDevicesChanged?.();

      if (settingsDevice?.id === deviceId) {
        setSettingsDevice(null);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleToggleFavorite = async (deviceId) => {
    const targetDevice = devices.find(
      (device) => device.id === deviceId
    );
    if (!targetDevice) {
      return;
    }

    try {
      await updateDevice(deviceId, {
        isFavorite: !targetDevice.isFavorite,
      });
      await onDevicesChanged?.();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSaveSettings = async (updatedDevice) => {
    try {
      await updateDevice(updatedDevice.id, {
        name: updatedDevice.name,
        isFavorite: updatedDevice.isFavorite,
      });
      await onDevicesChanged?.();
      setSettingsDevice(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleFirmwareUpdate = async (deviceId) => {
    try {
      await requestFirmwareUpdate(deviceId);
      await onDevicesChanged?.();
      alert("펌웨어 업데이트를 요청했습니다.");
    } catch (error) {
      alert (error.message);
    }
  };

  const handleAcceptInvite = async () => {
    const code = window.prompt("보호자 초대 코드를 입력하세요");
    if (!code) return;

    try {
      await acceptInvite(code.trim().toUpperCase());
      await onDevicesChanged?.();
      alert("기기가 연결되었습니다.");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCreateInvite = async (device) => {
    const relation = window.prompt(
      "보호자와의 관계를 입력하세요 (예: 딸, 아들, 배우자)"
    );
    if (!relation) return;

    try {
      const invite = await createInvite(device.id, relation);
      const expires = new Date(invite.expiresAt).toLocaleString("ko-KR");

      window.prompt(
        `아래 코드를 보호자에게 전달하세요.\n${expires} 까지 유효합니다.`,
        invite.code
      );
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <PageContainer>
      <PageTop>
        <PageTitle>기기 관리</PageTitle>

      <ButtonGroup>
        <InviteCodeButton type="button" onClick={handleAcceptInvite}>
          코드로 연결
        </InviteCodeButton>
        
        <AddDeviceButton
          type="button"
          onClick={handleOpenAddModal}
        >
          <Plus size={18} />
          기기 추가
        </AddDeviceButton>
      </ButtonGroup>
    </PageTop>

      <DeviceStatsSection devices={devices} />

      <DeviceList
        devices={devices}
        onDelete={handleDeleteDevice}
        onMonitoring={onNavigateMonitoring}
        onOpenSettings={setSettingsDevice}
        onToggleFavorite={handleToggleFavorite}
      />

      {isAddModalOpen && (
        <AddDeviceModal
          devices={availableDevices}
          onClose={() => setIsAddModalOpen(false)}
          onConnect={handleConnectDevice}
        />
      )}

      {settingsDevice && (
        <DeviceSettingsModal
          device={settingsDevice}
          onClose={() => setSettingsDevice(null)}
          onSave={handleSaveSettings}
          onFirmwareUpdate={handleFirmwareUpdate}
          onCreateInvite={handleCreateInvite}
        />
      )}
    </PageContainer>
  );
};

export default DeviceManagementPage;

const PageContainer = styled.div`
  width: 100%;
  padding: 22px;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const PageTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
`;

const PageTitle = styled.h2`
  color: #1a2335;
  font-size: 18px;
  font-weight: 850;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
`;

const InviteCodeButton = styled.button`
  min-height: 39px;
  padding: 0 16px;
  border: 1px solid #d7dde8;
  border-radius: 20px;
  color: #45536b;
  background: #ffffff;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: #b9c4d4;
    background: #f8fafc;
  }
`;

const AddDeviceButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 39px;
  padding: 0 18px;
  border-radius: 20px;
  color: #ffffff;
  background: #4d63f5;
  box-shadow: 0 7px 17px rgba(77, 99, 245, 0.2);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: #3f54e6;
    box-shadow: 0 10px 22px rgba(77, 99, 245, 0.29);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;