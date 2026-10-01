import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  Activity,
  Thermometer,
  Zap,
} from "lucide-react";

import { getMonitoringData } from "../api/monitoringApi";
import MonitoringChartCard from "../components/monitoring/MonitoringChartCard";
import MonitoringSummarySection from "../components/monitoring/MonitoringSummarySection";
import TimeRangeTabs from "../components/monitoring/TimeRangeTabs";

const REALTIME_REFRESH_INTERVAL = 5000;

// 서버가 limits 를 주지 않을 때 쓰는 기본 위험 기준 (서버 기본값과 같음, 전류는 A)
const DEFAULT_LIMITS = { temperature: 50, current: 4, voltage: 14.5 };

// 전류는 서버가 A 로 주고, 화면에는 실제 기기(LCD·시리얼)와 같은 mA 로 보여 준다
const toMilliAmp = (amp) =>
  amp == null ? null : Math.round(Number(amp) * 1000);

const formatValue = (value, digits) =>
  value == null ? "-" : Number(value).toFixed(digits);

const MonitoringPage = ({ deviceId, selectedDevice }) => {
  const [selectedRange, setSelectedRange] =
    useState("realtime");

  const [measurements, setMeasurements] = useState([]);
  const [limits, setLimits] = useState(DEFAULT_LIMITS);
  // 기기가 마지막으로 보낸 지금 값 (대시보드와 같은 값)
  const [live, setLive] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!deviceId) return;

    let isCancelled = false;

    const loadMonitoringData = async () => {
      try {
        const response = await getMonitoringData({
          deviceId,
          range: selectedRange,
        });

        if (isCancelled) {
          return;
        }

        setMeasurements(response?.measurements ?? []);
        setLimits({ ...DEFAULT_LIMITS, ...response?.limits });
        setLive(response?.live ?? null);
        setError("");
        setIsLoading(false);
      } catch (requestError) {
        if (isCancelled) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "모니터링 데이터를 불러오지 못했습니다."
        );

        setIsLoading(false);
      }
    };

    loadMonitoringData();

    return () => {
      isCancelled = true;
    };
  }, [deviceId, selectedRange]);

  useEffect(() => {
    if (!deviceId || selectedRange !== "realtime") {
      return undefined;
    }

    let isCancelled = false;

    const refreshMonitoringData = async () => {
      try {
        const response = await getMonitoringData({
          deviceId,
          range: "realtime",
        });

        if (isCancelled) {
          return;
        }

        setMeasurements(response?.measurements ?? []);
        setLimits({ ...DEFAULT_LIMITS, ...response?.limits });
        setLive(response?.live ?? null);
        setError("");
      } catch (requestError) {
        if (isCancelled) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "실시간 데이터를 갱신하지 못했습니다."
        );
      }
    };

    const intervalId = window.setInterval(
      refreshMonitoringData,
      REALTIME_REFRESH_INTERVAL
    );

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [deviceId, selectedRange]);

  const latestMeasurement = useMemo(() => {
    if (measurements.length === 0) {
      return null;
    }

    return measurements[measurements.length - 1];
  }, [measurements]);

  // 그래프용 데이터 — 전류를 mA 로 바꾼 칸(currentMa)을 더한다
  const chartData = useMemo(
    () =>
      measurements.map((point) => ({
        ...point,
        currentMa: toMilliAmp(point.current),
      })),
    [measurements]
  );

  // 카드에 보이는 "지금 값" — 서버가 live 를 주면 대시보드와 같은 현재 상태를 쓰고,
  // (예전 서버라서) 없으면 그래프의 마지막 점을 쓴다.
  // 그래프는 충전 중 기록만 담기 때문에, 차단·비상정지로 충전이 멈추면 그래프는 멈추고 카드만 바뀐다.
  const nowValues = live ?? latestMeasurement;
  const displayValues = nowValues && {
    ...nowValues,
    current: toMilliAmp(nowValues.current),
  };
  const displayLimits = {
    ...limits,
    current: toMilliAmp(limits.current),
  };
  const isStopped = live != null && !live.isCharging;

  const temperatureStatus =
    displayValues?.temperature != null && displayValues.temperature < displayLimits.temperature
      ? "normal"
      : "warning";

  // 충전기 온도도 배터리 온도와 같은 차단 기준을 쓴다
  const chargerTemperatureStatus =
    displayValues?.chargerTemperature != null &&
    displayValues.chargerTemperature < displayLimits.temperature
      ? "normal"
      : "warning";

  const currentStatus =
    displayValues?.current != null && displayValues.current < displayLimits.current
      ? "normal"
      : "warning";

  const voltageStatus =
    displayValues?.voltage != null && displayValues.voltage < displayLimits.voltage
      ? "normal"
      : "warning";

  const handleRangeChange = (nextRange) => {
    if (nextRange === selectedRange) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSelectedRange(nextRange);
  };

  const handleRetry = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getMonitoringData({
        deviceId,
        range: selectedRange,
      });

      setMeasurements(response?.measurements ?? []);
      setLimits({ ...DEFAULT_LIMITS, ...response?.limits });
      setLive(response?.live ?? null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "모니터링 데이터를 불러오지 못했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageTop>
        <TitleArea>
          <PageTitle>실시간 모니터링</PageTitle>

          {selectedDevice && (
            <DeviceDescription>
              {selectedDevice.name} · {selectedDevice.id}
            </DeviceDescription>
          )}
        </TitleArea>

        <TimeRangeTabs
          selectedRange={selectedRange}
          onChangeRange={handleRangeChange}
        />
      </PageTop>

      {!deviceId && (
        <StateBox>
          등록된 기기가 없습니다.
        </StateBox>
      )}

      {deviceId && isLoading && !displayValues && (
        <StateBox>
          모니터링 데이터를 불러오는 중입니다.
        </StateBox>
      )}

      {error && !displayValues && (
        <ErrorBox>
          <p>{error}</p>

          <RetryButton
            type="button"
            onClick={handleRetry}
          >
            다시 시도
          </RetryButton>
        </ErrorBox>
      )}

      {displayValues && (
        <>
          {isStopped && (
            <StoppedNotice>
              충전 중이 아닙니다 (차단 또는 비상정지). 카드는 지금 측정값이고,
              그래프는 마지막으로 충전 중이던 기록까지 표시합니다.
            </StoppedNotice>
          )}

          <MonitoringSummarySection
            values={displayValues}
            limits={displayLimits}
          />
        </>
      )}

      {measurements.length > 0 && (
        <ChartsSection>
          <ChartRow>
            <MonitoringChartCard
              title="배터리 온도"
              threshold={`기준 ${displayLimits.temperature}°C 미만`}
              value={formatValue(displayValues?.temperature, 1)}
              unit="°C"
              status={temperatureStatus}
              data={chartData}
              valueKey="temperature"
              color="#e96619"
              icon={Thermometer}
            />

            <MonitoringChartCard
              title="충전기 온도"
              threshold={`기준 ${displayLimits.temperature}°C 미만`}
              value={formatValue(displayValues?.chargerTemperature, 1)}
              unit="°C"
              status={chargerTemperatureStatus}
              data={chartData}
              valueKey="chargerTemperature"
              color="#d63b4a"
              icon={Thermometer}
            />
          </ChartRow>

          <ChartRow>
            <MonitoringChartCard
              title="충전 전류"
              threshold={`기준 ${displayLimits.current}mA 미만`}
              value={formatValue(displayValues?.current, 0)}
              unit="mA"
              status={currentStatus}
              data={chartData}
              valueKey="currentMa"
              color="#4d63f5"
              icon={Zap}
            />

            <MonitoringChartCard
              title="배터리 전압"
              threshold={`기준 ${displayLimits.voltage}V 미만`}
              value={formatValue(displayValues?.voltage, 2)}
              unit="V"
              status={voltageStatus}
              data={chartData}
              valueKey="voltage"
              color="#6555ef"
              icon={Activity}
            />
          </ChartRow>
        </ChartsSection>
      )}

      {!isLoading &&
        !error &&
        measurements.length === 0 && (
          <StateBox>
            {displayValues
              ? "이 구간에는 충전 중 기록이 없습니다. 그래프는 충전 중일 때만 기록됩니다."
              : "표시할 모니터링 데이터가 없습니다."}
          </StateBox>
        )}
    </PageContainer>
  );
};

export default MonitoringPage;

const PageContainer = styled.div`
  width: 100%;
  padding: 22px;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const PageTop = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 650px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const TitleArea = styled.div`
  min-width: 0;
`;

const PageTitle = styled.h2`
  color: #182236;
  font-size: 17px;
  font-weight: 850;
`;

const DeviceDescription = styled.p`
  margin-top: 4px;
  color: #939fb2;
  font-size: 10px;
  font-weight: 600;
`;

const ChartsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 17px;
`;

// 그래프 두 개를 나란히 놓는 줄 — 윗줄은 두 온도, 아랫줄은 전류·전압
const ChartRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
`;

const StoppedNotice = styled.p`
  margin-top: 17px;
  padding: 12px 16px;
  border: 1px solid #f2df9d;
  border-radius: 14px;
  color: #ba6e00;
  background: #fffbed;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.6;
`;

const StateBox = styled.div`
  margin-top: 18px;
  padding: 55px 20px;
  border: 1px solid #e2e7ef;
  border-radius: 18px;
  color: #7e8a9f;
  background: #ffffff;
  text-align: center;
`;

const ErrorBox = styled(StateBox)`
  color: #d54a4f;
`;

const RetryButton = styled.button`
  margin-top: 15px;
  padding: 10px 18px;
  border: none;
  border-radius: 15px;
  color: #ffffff;
  background: #4d63f5;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: #4055e8;
    transform: translateY(-1px);
  }
`;