// Utility function to clean up old acceptances
export const cleanupOldAcceptances = async () => {
  const acceptedRisks = JSON.parse(localStorage.getItem("accepted_risks") || "{}");

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Remove acceptances older than 24 hours
  const cleanedRisks = Object.entries(acceptedRisks).reduce(
    (acc: any, [url, data]: [string, any]) => {
      if (now - data.timestamp < ONE_DAY) {
        acc[url] = data;
      }
      return acc;
    },
    {}
  );

  localStorage.setItem("accepted_risks", JSON.stringify(cleanedRisks));
};
