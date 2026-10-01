import styled from "styled-components";

import MetricSummaryCard from "./MetricSummaryCard";

const MonitoringSummarySection = ({
  latestMeasurement,
  limits,
}) => {
  if (!latestMeasurement) {
    return null;
  }

  const temperature = latestMeasurement.temperature;
  const current = latestMeasurement.current;
  const voltage = latestMeasurement.voltage;

  const temperatureStatus =
    temperature != null && temperature < limits.temperature
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
        label="충전 전류"
        value={format(current, 2)}
        unit="A"
        threshold={`기준 ${limits.current}A 미만`}
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

const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 17px;

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
`;