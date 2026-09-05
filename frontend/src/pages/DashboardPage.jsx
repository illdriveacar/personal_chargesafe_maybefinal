import { useEffect, useState } from "react";
import styled from "styled-components";
import { Activity, Thermometer, Zap } from "lucide-react";

import AIRecommendationCard from "../components/dashboard/AIRecommendationCard";
import ChargeStatusCard from "../components/dashboard/ChargeStatusCard";
import EmergencyAlert from "../components/dashboard/EmergencyAlert";
import SensorCard from "../components/dashboard/SensorCard";
import SummarySection from "../components/dashboard/SummarySection";

import { getDashboard } from "../api/devices";

const DashboardPage = ({ deviceId, onEmergencyClick }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!deviceId) return;

    let cancelled = false;

    const load = () => {
      getDashboard(deviceId)
        .then((data) => {
          if (cancelled) return;
          setDashboardData(data);
          setError("");
        })
        .catch((requestError) => {
          // 5초마다 재시도하므로 alert 대신 화면에 표시한다 (창이 반복해서 뜨는 것을 막는다)
          if (!cancelled) setError(requestError.message);
        });
    };
    
    load();
    const timer = setInterval(load,5000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [deviceId]);

  if (!deviceId) {
    return <LoadingBox>등록된 기기가 없습니다.</LoadingBox>;
  }

  if (error && !dashboardData) {
    return <LoadingBox>{error}</LoadingBox>;
  }

  if (!dashboardData) {
    return <LoadingBox>대시보드 데이터를 불러오는 중입니다.</LoadingBox>;
  }

  return (
    <DashboardContent>
      <SummarySection data={dashboardData} />

      <MainGrid>
        <ChargeStatusCard
          chargePercent={dashboardData.chargePercent}
          targetPercent={dashboardData.targetPercent}
          completionTime={dashboardData.completionTime}
          completionPeriod={dashboardData.completionPeriod}
          remainingTime={dashboardData.remainingTime}
          chargingStatus={dashboardData.chargingStatus}
        />

        <RightContent>
          <SensorGrid>
            <SensorCard
              icon={Thermometer}
              value={dashboardData.temperature.value ?? "-"}
              unit={dashboardData.temperature.unit}
              label="온도"
              status={dashboardData.temperature.status}
              progress={dashboardData.temperature.progress}
              valueColor="#E76408"
              iconColor="#EF851A"
              iconBackground="#FFF5E9"
              progressColor="#F0B15C"
            />

            <SensorCard
              icon={Zap}
              value={dashboardData.current.value ?? "-"}
              unit={dashboardData.current.unit}
              label="전류"
              status={dashboardData.current.status}
              progress={dashboardData.current.progress}
              valueColor="#5267F3"
              iconColor="#5272F7"
              iconBackground="#EEF3FF"
              progressColor="#80A7F6"
            />

            <SensorCard
              icon={Activity}
              value={dashboardData.voltage.value ?? "-"}
              unit={dashboardData.voltage.unit}
              label="전압"
              status={dashboardData.voltage.status}
              progress={dashboardData.voltage.progress}
              valueColor="#6249E9"
              iconColor="#7357EC"
              iconBackground="#F1EFFF"
              progressColor="#9D8CF1"
            />
          </SensorGrid>

          <AIRecommendationCard
            confidence={dashboardData.aiConfidence ?? 0}
            recommendedPercent={
              dashboardData.aiRecommendation.recommendedPercent
            }
            message={dashboardData.aiRecommendation.message}
            batteryHealth={dashboardData.batteryHealth ?? 0}
          />

          <EmergencyAlert
            alert={dashboardData.emergencyAlert}
            onClick={() => onEmergencyClick?.(dashboardData.temperature.value)}
          />
        </RightContent>
      </MainGrid>
    </DashboardContent>
  );
};

export default DashboardPage;

const DashboardContent = styled.div`
  width: 100%;
  padding: 22px;

  @media (max-width: 768px) {
    padding: 14px;
  }
`;

const MainGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(350px, 470px) minmax(0, 1fr);
  gap: 18px;
  margin-top: 18px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const RightContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`;

const SensorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingBox = styled.div`
  margin: 22px;
  padding: 50px;
  border-radius: 18px;
  color: #758197;
  background: #ffffff;
  text-align: center;
`;