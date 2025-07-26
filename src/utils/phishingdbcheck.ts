import { handleResponse, handleError } from "./constant";

async function phishingdbCheck(currentUrl: string) {
  // For web app, we can make direct API calls to check phishing databases
  const response = await fetch(`https://api.scambuzzer.com/api/phishing/check?url=${encodeURIComponent(currentUrl)}`);
  const result = await response.json();
  return result?.response;
}

export async function checkPhishingSite(currentUrl: string): Promise<[]> {
  try {
    const result = await phishingdbCheck(currentUrl);
    return result;
  } catch (error) {
    console.error("Fetching phishing sites check failes!", error);
    return [];
  }
}
