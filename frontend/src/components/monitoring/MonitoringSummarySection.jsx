import styled from "styled-components";

import MetricSummaryCard from "./MetricSummaryCard";

// values·limits 는 화면용 단위로 받는다 (온도 ℃, 전류 mA, 전압 V)
const MonitoringSummarySection = ({
  values,
  limits,
}) => {
  if (!values) {
    return null;
  }

  const temperature = values.temperature;
  const chargerTemperature = values.chargerTemperature;
  const current = values.current;
  const voltage = values.voltage;

  const temperatureStatus =
    temperature != null && temperature < limits.temperature
      ? "normal"
      : "warning";

  // 충전기 온도도 배터리 온도와 같은 차단 기준을 쓴다
  const chargerTemperatureStatus =
    chargerTemperature != null && chargerTemperature < limits.temperature
      ? "normal"
      : "warning";

  const currentStatus =
    current != null && current < limits.current
      ? "normal"
      : "warning";

  const voltageStatus =
    voltage != null && voltage < limits.voltage
      ? "normal"
      : "warning";

  const format = (value, digits) =>
    value == null ? "-" : Number(value).toFixed(digits);

  return (
    <SummaryGrid>
      <MetricSummaryCard
        label="배터리 온도"
        value={format(temperature, 1)}
        unit="°C"
        threshold={`기준 ${limits.temperature}°C 미만`}
        status={temperatureStatus}
        valueColor="#dd5a00"
      />

      <MetricSummaryCard
        label="충전기 온도"
        value={format(chargerTemperature, 1)}
        unit="°C"
        threshold={`기준 ${limits.temperature}°C 미만`}
        status={chargerTemperatureStatus}
        valueColor="#d63b4a"
      />

      <MetricSummaryCard
        label="충전 전류"
        value={format(current, 0)}
        unit="mA"
        threshold={`기준 ${limits.current}mA 미만`}
        status={currentStatus}
        valueColor="#4d63f5"
      />

      <MetricSummaryCard
        label="배터리 전압"
        value={format(voltage, 2)}
        unit="V"
        threshold={`기준 ${limits.voltage}V 미만`}
        status={voltageStatus}
        valueColor="#6045ec"
      />
    </SummaryGrid>
  );
};

export default MonitoringSummarySection;

// 요약 카드 4장 — 화면이 좁아지면 2×2, 더 좁으면 한 줄에 하나
const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 17px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;