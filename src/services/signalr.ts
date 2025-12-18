import * as signalR from "@microsoft/signalr";
import { API_CONFIG } from '../config';

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private callbacks: { [key: string]: Function[] } = {};
    private currentRoomId: string | null = null;
    private intentionalStop = false;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_CONFIG.API_BASE_PATH}/hubs/poker`)
            // Use explicit delays so we retry quickly at first, then back off.
            .withAutomaticReconnect([0, 2000, 10000, 30000])
            .build();

        // Background tabs can throttle timers and make the client think the server is gone.
        // Increase timeouts so we don't drop as aggressively.
        this.connection.serverTimeoutInMilliseconds = 120_000; // default ~30s
        this.connection.keepAliveIntervalInMilliseconds = 20_000; // default ~15s

        this.connection.on("ReceiveSmile", (fromUsername: string, toUsername: string, emoji: string) => {
            this.trigger("ReceiveSmile", fromUsername, toUsername, emoji);
        });

        this.connection.onreconnecting((err) => {
            // Handlers stay registered, but room membership might need to be re-established after reconnect.
            // (JoinRoom is done in onreconnected)
            // console.debug("SignalR reconnecting...", err);
        });

        this.connection.onreconnected(async () => {
            if (!this.connection) return;
            if (!this.currentRoomId) return;
            try {
                await this.connection.invoke("JoinRoom", this.currentRoomId);
            } catch (err) {
                console.error("SignalR re-JoinRoom failed after reconnect", err);
            }
        });

        this.connection.onclose((err) => {
            // If automatic reconnect gives up, we still want to keep trying in the background
            // (unless the user intentionally disconnected / navigated away).
            if (this.intentionalStop) return;
            if (!this.currentRoomId) return;
            if (this.reconnectTimer) return;

            this.reconnectTimer = setTimeout(() => {
                this.reconnectTimer = null;
                this.connect(this.currentRoomId!).catch((e) => console.error("SignalR reconnect (manual) failed", e));
            }, 5000);

            if (err) {
                // console.warn("SignalR closed", err);
            }
        });
    }

    public async connect(roomId: string) {
        this.currentRoomId = roomId;
        this.intentionalStop = false;

        if (!this.connection) return;

        // If we're disconnected, start the transport.
        if (this.connection.state === signalR.HubConnectionState.Disconnected) {
            await this.connection.start();
        } else if (this.connection.state === signalR.HubConnectionState.Connecting || this.connection.state === signalR.HubConnectionState.Reconnecting) {
            // Wait a bit for the current transition to finish before invoking server methods.
            await this.waitForConnected(15_000);
        }

        // Ensure we (re)join the room even if we were already connected.
        if (this.connection.state === signalR.HubConnectionState.Connected) {
            await this.connection.invoke("JoinRoom", roomId);
        }
    }

    public async disconnect(roomId: string) {
        this.intentionalStop = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (!this.connection) return;

        try {
            if (this.connection.state === signalR.HubConnectionState.Connected) {
                await this.connection.invoke("LeaveRoom", roomId);
            }
        } finally {
            await this.connection.stop();
            if (this.currentRoomId === roomId) this.currentRoomId = null;
        }
    }

    public async sendSmile(roomId: string, toUsername: string, fromUsername: string, emoji: string) {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            await this.connection.invoke("SendSmile", roomId, toUsername, fromUsername, emoji);
        }
    }

    public on(event: string, callback: Function) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }

    public off(event: string, callback: Function) {
        if (!this.callbacks[event]) {
            return;
        }
        this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }

    private trigger(event: string, ...args: any[]) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(cb => cb(...args));
        }
    }

    private waitForConnected(timeoutMs: number) {
        if (!this.connection) return Promise.resolve();
        if (this.connection.state === signalR.HubConnectionState.Connected) return Promise.resolve();

        return new Promise<void>((resolve, reject) => {
            const startedAt = Date.now();
            const tick = () => {
                if (!this.connection) return resolve();
                if (this.connection.state === signalR.HubConnectionState.Connected) return resolve();
                if (Date.now() - startedAt > timeoutMs) return reject(new Error("SignalR connection did not reach Connected state in time"));
                setTimeout(tick, 250);
            };
            tick();
        });
    }
}

export const signalRService = new SignalRService();
