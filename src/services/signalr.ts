import * as signalR from "@microsoft/signalr";
import { API_CONFIG } from '../config';

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private callbacks: { [key: string]: Function[] } = {};

    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_CONFIG.API_BASE_PATH}/hubs/poker`)
            .withAutomaticReconnect()
            .build();

        this.connection.on("ReceiveSmile", (fromUsername: string, toUsername: string, emoji: string) => {
            this.trigger("ReceiveSmile", fromUsername, toUsername, emoji);
        });
    }

    public async connect(roomId: string) {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Disconnected) {
            await this.connection.start();
            await this.connection.invoke("JoinRoom", roomId);
        }
    }

    public async disconnect(roomId: string) {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            await this.connection.invoke("LeaveRoom", roomId);
            await this.connection.stop();
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
}

export const signalRService = new SignalRService();
