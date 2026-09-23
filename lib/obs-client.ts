import OBSWebSocket from 'obs-websocket-js';

class ObsClientService {
  private obs: OBSWebSocket | null = null;
  private isConnected = false;
  private connectionConfig = {
    address: 'ws://127.0.0.1:4455',
    password: '',
  };

  constructor() {
    this.obs = new OBSWebSocket();
  }

  public async connect(address = 'ws://127.0.0.1:4455', password = '') {
    if (!this.obs) {
      this.obs = new OBSWebSocket();
    }
    this.connectionConfig = { address, password };

    try {
      await this.obs.connect(address, password);
      this.isConnected = true;
      console.log(`[OBS-WS] Connected successfully to ${address}`);
      return true;
    } catch (err: any) {
      this.isConnected = false;
      console.warn(`[OBS-WS] Connection failed: ${err?.message || err}`);
      return false;
    }
  }

  public async disconnect() {
    if (this.obs && this.isConnected) {
      await this.obs.disconnect();
      this.isConnected = false;
      console.log('[OBS-WS] Disconnected from OBS');
    }
  }

  public getStatus() {
    return {
      connected: this.isConnected,
      address: this.connectionConfig.address,
    };
  }

  /**
   * Channel 4 Push: Updates text source content directly in OBS Studio
   */
  public async setInputText(inputName: string, text: string) {
    if (!this.isConnected || !this.obs) return false;
    try {
      await this.obs.call('SetInputSettings', {
        inputName,
        inputSettings: {
          text,
        },
      });
      return true;
    } catch (err) {
      // Ignored if source does not exist in OBS scene
      return false;
    }
  }

  /**
   * Triggers scene item visibility or hotkey in OBS
   */
  public async setSceneItemEnabled(sceneName: string, sceneItemId: number, enabled: boolean) {
    if (!this.isConnected || !this.obs) return false;
    try {
      await this.obs.call('SetSceneItemEnabled', {
        sceneName,
        sceneItemId,
        sceneItemEnabled: enabled,
      });
      return true;
    } catch (err) {
      return false;
    }
  }
}

export const obsClient = new ObsClientService();
export default obsClient;
