import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { NetworkInfo } from "react-native-network-info";

// const isDev = process.env.NODE_ENV === "development";

/**
 * Dohvata trenutni WiFi SSID koristeći NetInfo kao primarni izvor,
 * sa fallback-om na NetworkInfo. Vraća null za web platformu.
 * @returns {Promise<string|null>} Trenutni SSID ili null ako nije dostupan
 */
export async function getCurrentWifiSSID() {
    if (Platform.OS === "web") return null;

    try {
        const state = await NetInfo.fetch();
        if (state.type === "wifi" && state.details?.ssid) {
            // console.log("📡 SSID iz NetInfo:", state.details.ssid);
            return state.details.ssid;
        }

        const ssid = await NetworkInfo.getSSID();
        // console.log("📡 SSID iz NetworkInfo:", ssid);
        return ssid || null;
    } catch (error) {
        console.error("❌ Greška pri dohvatanju SSID-a:", error);
        return null;
    }
}

/**
 * Proverava da li je trenutni WiFi SSID među dozvoljenim SSID-ovima.
 * Za web platformu vraća true (PWA ne proverava WiFi).
 * @param {Array<{mreza: string}>} allowedSSIDs - Lista dozvoljenih SSID-ova sa backend-a
 * @returns {Promise<boolean>} True ako je SSID dozvoljen, false inače
 */
export async function isConnectedToAllowedNetwork(allowedSSIDs) {
    if (Platform.OS === "web") return true;

    const currentSSID = await getCurrentWifiSSID();
    if (!currentSSID || !Array.isArray(allowedSSIDs) || allowedSSIDs.length === 0) {
        return false;
    }

    const allowedSSIDNames = allowedSSIDs
        .map(obj => (obj && typeof obj === "object" && obj.mreza ? obj.mreza : ""))
        .filter(Boolean);

    {
        // console.log("📡 Dozvoljeni SSID-ovi:", allowedSSIDNames);
        // console.log("📶 Trenutni SSID:", currentSSID);
    }

    return allowedSSIDNames.some((ssid) => currentSSID.toLowerCase().includes(ssid.toLowerCase()));

    //   return allowedSSIDNames.some(ssid => 
    //     currentSSID.toLowerCase() === ssid.toLowerCase()
    //   );
}
