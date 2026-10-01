import styled from "styled-components";

// 충전 상태별 배지 문구와 색 — stopped 는 비상정지 버튼으로 사람이 멈춘 경우
const STATUS_STYLES = {
  blocked: { label: "자동 차단", dot: "#ef6a6d", color: "#df3d40", background: "#fff1ef" },
  stopped: { label: "비상정지", dot: "#f0a020", color: "#b86e00", background: "#fff7e6" },
  charging: { label: "충전 중", dot: "#5877f7", color: "#3f54d8", background: "#eef2ff" },
  completed: { label: "정상 완료", dot: "#69d67b", color: "#438e4e", background: "#f1fbf2" },
};

const ChargingHistoryRow = ({ history }) => {
  const statusStyle = STATUS_STYLES[history.status] ?? STATUS_STYLES.completed;
  const isDanger = history.maxTemperature >= 50;

  return (
    <Row>
      <DateCell>
        <StatusDot $color={statusStyle.dot} />

        <DateText>
          <DateTitle>{history.date}</DateTitle>
          <DateLabel>{history.dateLabel}</DateLabel>
        </DateText>
      </DateCell>

      <Cell>{history.startTime}</Cell>
      <Cell>{history.endTime}</Cell>
      <DurationCell>{history.chargingDuration}</DurationCell>
      <Cell>{history.startBattery}%</Cell>
      <EndBatteryCell>{history.endBattery}%</EndBatteryCell>

      <TemperatureCell $isDanger={isDanger}>
        {history.maxTemperature}°C
      </TemperatureCell>

      <StatusCell>
        <StatusBadge $color={statusStyle.color} $background={statusStyle.background}>
          {statusStyle.label}
        </StatusBadge>
      </StatusCell>
    </Row>
  );
};

export default ChargingHistoryRow;

const Row = styled.tr`
  height: 59px;
  border-bottom: 1px solid #f0f2f6;
  background: #ffffff;
  transition: background 0.18s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f7f9fc;
  }

  td {
    padding: 11px 16px;
    vertical-align: middle;
  }
`;

const DateCell = styled.td`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const DateText = styled.div``;

const DateTitle = styled.strong`
  display: block;
  color: #20283b;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
`;

const DateLabel = styled.span`
  display: block;
  margin-top: 2px;
  color: #a1aabd;
  font-size: 10px;
`;

const Cell = styled.td`
  color: #374259;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

const DurationCell = styled(Cell)`
  color: #192136;
  font-weight: 800;
`;

const EndBatteryCell = styled(Cell)`
  color: #4d63f5;
  font-weight: 800;
`;

const TemperatureCell = styled(Cell)`
  color: ${({ $isDanger }) => ($isDanger ? "#e02424" : "#252e42")};
  font-weight: 800;
`;

const StatusCell = styled.td`
  white-space: nowrap;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 65px;
  padding: 5px 10px;
  border-radius: 13px;
  color: ${({ $color }) => $color};
  background: ${({ $background }) => $background};
  font-size: 10px;
  font-weight: 750;
`;