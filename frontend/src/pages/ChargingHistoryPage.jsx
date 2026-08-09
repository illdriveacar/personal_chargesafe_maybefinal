import { useEffect, useState } from "react";
import styled from "styled-components";

import ChargingHistoryTable from "../components/history/ChargingHistoryTable";
import HistoryStatsSection from "../components/history/HistoryStatsSection";

import { getHistory } from "../api/devices";

const ChargingHistoryPage = ({ deviceId }) => {
  const [histories, setHistories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!deviceId) return;

    let cancelled = false;

    getHistory(deviceId)
      .then((data) => {
        if (cancelled) return;
        setHistories(data.items);
        setSummary(data.summary);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      });

    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  if (!deviceId) {
    return <LoadingBox>등록된 기기가 없습니다.</LoadingBox>;
  }

  if (error) {
    return <LoadingBox>{error}</LoadingBox>;
  }

  if (!summary) {
    return <LoadingBox>충전 이력을 불러오는 중입니다.</LoadingBox>;
  }

  return (
    <HistoryContent>
      <HistoryStatsSection summary={summary} />
      <ChargingHistoryTable histories={histories} />
    </HistoryContent>
  );
};

export default ChargingHistoryPage;

const HistoryContent = styled.div`
  width: 100%;
  padding: 21px 22px 30px;

  @media (max-width: 768px) {
    padding: 15px;
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