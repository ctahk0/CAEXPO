// 📁 utils/useWifiStatus.js
import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { getCurrentWifiSSID, isConnectedToAllowedNetwork } from "./wifi-check";

export default function useWifiStatus(allowedSSIDs = []) {
  const [wifiSSID, setWifiSSID] = useState(null);
  const [isAllowedNetwork, setIsAllowedNetwork] = useState(false);

  useEffect(() => {
    const fetchSSID = async () => {
      const ssid = await getCurrentWifiSSID();
      setWifiSSID(ssid);
      const allowed = await isConnectedToAllowedNetwork(allowedSSIDs);
      setIsAllowedNetwork(allowed);
    };

    fetchSSID();

    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.type === "wifi") {
        const ssid = await getCurrentWifiSSID();
        setWifiSSID(ssid);
        const allowed = await isConnectedToAllowedNetwork(allowedSSIDs);
        setIsAllowedNetwork(allowed);
      } else {
        setWifiSSID(null);
        setIsAllowedNetwork(false);
      }
    });

    return () => unsubscribe();
  }, [allowedSSIDs]);

  return { wifiSSID, isAllowedNetwork };
}
