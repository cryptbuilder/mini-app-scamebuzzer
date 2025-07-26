// Farcaster Mini App Storage Utility
export class FarcasterStorage {
  private static instance: FarcasterStorage;
  private memoryStorage: Map<string, any> = new Map();

  static getInstance(): FarcasterStorage {
    if (!FarcasterStorage.instance) {
      FarcasterStorage.instance = new FarcasterStorage();
    }
    return FarcasterStorage.instance;
  }

  // Store data in sessionStorage (persists during the session)
  async setItem(key: string, value: any): Promise<void> {
    try {
      // Use sessionStorage for Mini App session persistence
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('SessionStorage not available, using memory storage:', error);
      this.memoryStorage.set(key, value);
    }
  }

  // Get data from sessionStorage
  async getItem(key: string): Promise<any> {
    try {
      // Use sessionStorage for Mini App session persistence
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('SessionStorage not available, using memory storage:', error);
      return this.memoryStorage.get(key) || null;
    }
  }

  // Remove data from storage
  async removeItem(key: string): Promise<void> {
    try {
      // Use sessionStorage for Mini App session persistence
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('SessionStorage not available, using memory storage:', error);
      this.memoryStorage.delete(key);
    }
  }

  // Clear all data
  async clear(): Promise<void> {
    try {
      // Use sessionStorage for Mini App session persistence
      sessionStorage.clear();
    } catch (error) {
      console.warn('SessionStorage not available, using memory storage:', error);
      this.memoryStorage.clear();
    }
  }

  // Get URL parameters (useful for passing data between pages)
  getUrlParam(key: string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
  }

  // Set URL parameters
  setUrlParam(key: string, value: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url.toString());
  }

  // Remove URL parameter
  removeUrlParam(key: string): void {
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    window.history.replaceState({}, '', url.toString());
  }

  // Store data in memory (temporary, lost on page refresh)
  setMemoryItem(key: string, value: any): void {
    this.memoryStorage.set(key, value);
  }

  // Get data from memory
  getMemoryItem(key: string): any {
    return this.memoryStorage.get(key) || null;
  }

  // Remove data from memory
  removeMemoryItem(key: string): void {
    this.memoryStorage.delete(key);
  }
}

// Export singleton instance
export const farcasterStorage = FarcasterStorage.getInstance();

// Convenience functions for common storage operations
export const storeSession = async (session: any) => {
  await farcasterStorage.setItem('session', session);
};

export const getSession = async () => {
  return await farcasterStorage.getItem('session');
};

export const removeSession = async () => {
  await farcasterStorage.removeItem('session');
};

export const storeUserPlan = async (plan: number) => {
  await farcasterStorage.setItem('userPlan', plan);
};

export const getUserPlan = async () => {
  return await farcasterStorage.getItem('userPlan') || 0;
};

export const storeScanData = async (data: any) => {
  await farcasterStorage.setItem('scanData', data);
};

export const getScanData = async () => {
  return await farcasterStorage.getItem('scanData') || {};
}; 