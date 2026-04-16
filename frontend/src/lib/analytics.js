import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const STORAGE_KEY = "portfolio_session_id";

function getSessionId() {
  let sessionId = sessionStorage.getItem(STORAGE_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(STORAGE_KEY, sessionId);
  }
  return sessionId;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  
  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return { browser, os, isMobile, userAgent: ua };
}

let cachedIpInfo = null;
async function getIpInfo() {
  if (cachedIpInfo) return cachedIpInfo;
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      cachedIpInfo = await res.json();
      return cachedIpInfo;
    }
  } catch (e) {
    console.warn("[Analytics] IP fetch failed:", e);
  }
  return null;
}

export async function trackPageView(page, referrer = document.referrer) {
  if (!db) return;
  
  const sessionId = getSessionId();
  const device = getDeviceInfo();
  const ipInfo = await getIpInfo();
  
  const data = {
    type: "pageview",
    sessionId,
    page,
    referrer,
    timestamp: serverTimestamp(),
    device: {
      browser: device.browser,
      os: device.os,
      isMobile: device.isMobile,
    },
    location: ipInfo ? {
      ip: ipInfo.ip,
      city: ipInfo.city,
      country: ipInfo.country_name,
      countryCode: ipInfo.country_code,
      region: ipInfo.region,
      timezone: ipInfo.timezone,
    } : null,
  };

  try {
    await addDoc(collection(db, "analytics"), data);
  } catch (e) {
    console.warn("[Analytics] trackPageView failed:", e);
  }
}

export async function trackPageDuration(page, durationSeconds) {
  if (!db) return;
  
  const sessionId = getSessionId();
  const device = getDeviceInfo();
  const ipInfo = await getIpInfo();

  const data = {
    type: "page_duration",
    sessionId,
    page,
    durationSeconds: Math.round(durationSeconds),
    timestamp: serverTimestamp(),
    device: {
      browser: device.browser,
      os: device.os,
      isMobile: device.isMobile,
    },
    location: ipInfo ? {
      ip: ipInfo.ip,
      city: ipInfo.city,
      country: ipInfo.country_name,
      countryCode: ipInfo.country_code,
    } : null,
  };

  try {
    await addDoc(collection(db, "analytics"), data);
  } catch (e) {
    console.warn("[Analytics] trackPageDuration failed:", e);
  }
}

export function usePageTracking() {
  const trackedPages = {};
  
  return {
    trackPage: (page) => {
      if (!trackedPages[page]) {
        trackedPages[page] = Date.now();
        trackPageView(page);
      }
    },
    getPageDuration: (page) => {
      return trackedPages[page] ? (Date.now() - trackedPages[page]) / 1000 : 0;
    },
    trackedPages,
  };
}