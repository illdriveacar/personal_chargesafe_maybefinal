import { useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { X } from "lucide-react";

import { typeConfig } from "./notificationTypes";

// 위험 알림은 사용자가 닫을 때까지 남기고, 나머지는 이 시간 뒤 자동으로 닫는다
const AUTO_CLOSE_MS = 8000;

/**
 * 새 알림 팝업 — 어느 화면에 있든 오른쪽 위에 뜬다.
 * 팝업을 누르면 알림 센터로 이동하고, X 를 누르면 팝업만 닫는다(알림은 그대로 남음).
 */
const NotificationToast = ({ toasts, onClose, onOpen }) => {
  if (!toasts.length) {
    return null;
  }

  return (
    <ToastStack>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={onClose}
          onOpen={onOpen}
        />
      ))}
    </ToastStack>
  );
};

const ToastItem = ({ toast, onClose, onOpen }) => {
  const config = typeConfig[toast.type] ?? typeConfig.info;
  const Icon = config.icon;
  const isDanger = toast.type === "danger";

  useEffect(() => {
    if (isDanger) {
      return undefined;
    }

    const timer = setTimeout(() => onClose(toast.id), AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [isDanger, onClose, toast.id]);

  return (
    <ToastCard
      role={isDanger ? "alert" : "status"}
      $color={config.color}
    >
      <ToastBody type="button" onClick={() => onOpen(toast.id)}>
        <IconWrapper $color={config.color} $background={config.background}>
          <Icon size={18} strokeWidth={1.9} />
        </IconWrapper>

        <Content>
          <TitleRow>
            <Title $color={config.color}>{toast.title}</Title>
            <Time>{toast.time}</Time>
          </TitleRow>

          <Message>{toast.message}</Message>

          {toast.deviceName && (
            <DeviceName>{toast.deviceName}</DeviceName>
          )}
        </Content>
      </ToastBody>

      <CloseButton
        type="button"
        aria-label="알림 팝업 닫기"
        onClick={() => onClose(toast.id)}
      >
        <X size={15} />
      </CloseButton>
    </ToastCard>
  );
};

export default NotificationToast;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(24px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const ToastStack = styled.div`
  position: fixed;
  top: 84px;
  right: 22px;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(360px, calc(100vw - 32px));

  @media (max-width: 768px) {
    top: 72px;
    right: 16px;
  }
`;

const ToastCard = styled.div`
  position: relative;
  display: flex;
  overflow: hidden;
  border: 1px solid #edf0f4;
  border-left: 4px solid ${({ $color }) => $color};
  border-radius: 15px;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(24, 33, 54, 0.16);
  animation: ${slideIn} 0.25s ease;
`;

const ToastBody = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
  padding: 15px 38px 15px 15px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #f8faff;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: ${({ $color }) => $color};
  background: ${({ $background }) => $background};
`;

const Content = styled.div`
  min-width: 0;
  flex: 1;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled.strong`
  overflow: hidden;
  color: ${({ $color }) => $color};
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Time = styled.span`
  flex-shrink: 0;
  margin-left: auto;
  color: #a1acc0;
  font-size: 11px;
  font-weight: 650;
`;

const Message = styled.p`
  margin-top: 4px;
  color: #56637a;
  font-size: 12px;
  font-weight: 550;
  line-height: 1.5;
  word-break: keep-all;
`;

const DeviceName = styled.span`
  display: block;
  margin-top: 6px;
  color: #a1acc0;
  font-size: 10px;
  font-weight: 650;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  color: #9aa5b8;
  background: transparent;
  cursor: pointer;

  &:hover {
    color: #ffffff;
    background: #758197;
  }
`;
