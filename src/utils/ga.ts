export function trackGA(
  eventName: string,
  eventParams: Record<string, any> = {}
) {
  // For web app, we can make direct API calls to Google Analytics
  // or use a service like Google Analytics 4 Measurement Protocol
  try {
    // You can implement direct GA4 tracking here
    // For now, we'll just log the events
    console.log("GA Event:", eventName, eventParams);
    
    // Example: Direct GA4 API call
    // const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
    // const API_SECRET = import.meta.env.VITE_GA_API_SECRET;
    // if (MEASUREMENT_ID && API_SECRET) {
    //   fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`, {
    //     method: 'POST',
    //     body: JSON.stringify({
    //       client_id: 'web-app-client',
    //       events: [{ name: eventName, params: eventParams }]
    //     })
    //   });
    // }
  } catch (error) {
    console.error("Failed to track GA event:", error);
  }
}
