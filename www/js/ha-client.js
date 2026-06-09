/**
 * Minimale Home Assistant WebSocket-client.
 * Verbindt met de HA WebSocket API, authenticeert met een long-lived token,
 * haalt entiteiten op, luistert naar state-wijzigingen en roept services aan.
 *
 * Geen externe afhankelijkheden, zodat dit ongewijzigd in een Capacitor-schil draait.
 */
class HAClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");      // trailing slash weghalen
    this.token = token;
    this.ws = null;
    this.msgId = 1;
    this.pending = new Map();                          // id -> {resolve, reject}
    this.onStateChanged = null;                        // callback(entity)
    this.onClose = null;
  }

  _wsUrl() {
    // http -> ws, https -> wss
    const u = this.baseUrl.replace(/^http/, "ws");
    return `${u}/api/websocket`;
  }

  connect() {
    return new Promise((resolve, reject) => {
      let settled = false;
      try {
        this.ws = new WebSocket(this._wsUrl());
      } catch (e) {
        return reject(new Error("Ongeldige URL"));
      }

      this.ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);

        if (msg.type === "auth_required") {
          this.ws.send(JSON.stringify({ type: "auth", access_token: this.token }));
          return;
        }
        if (msg.type === "auth_ok") {
          settled = true;
          return resolve();
        }
        if (msg.type === "auth_invalid") {
          settled = true;
          this.ws.close();
          return reject(new Error("Token geweigerd: " + (msg.message || "ongeldig")));
        }
        if (msg.type === "result") {
          const p = this.pending.get(msg.id);
          if (p) {
            this.pending.delete(msg.id);
            msg.success ? p.resolve(msg.result) : p.reject(new Error(msg.error?.message || "Fout"));
          }
          return;
        }
        if (msg.type === "event" && msg.event?.event_type === "state_changed") {
          const newState = msg.event.data.new_state;
          if (newState && this.onStateChanged) this.onStateChanged(newState);
        }
      };

      this.ws.onerror = () => {
        if (!settled) reject(new Error("Kan geen verbinding maken. Klopt de URL en is HA bereikbaar?"));
      };

      this.ws.onclose = () => {
        if (!settled) reject(new Error("Verbinding gesloten voor authenticatie."));
        else if (this.onClose) this.onClose();
      };
    });
  }

  _send(payload) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, ...payload }));
    });
  }

  getStates() {
    return this._send({ type: "get_states" });
  }

  subscribeStateChanges() {
    return this._send({ type: "subscribe_events", event_type: "state_changed" });
  }

  callService(domain, service, entityId) {
    return this._send({
      type: "call_service",
      domain,
      service,
      target: { entity_id: entityId },
    });
  }

  callServiceData(domain, service, serviceData = {}) {
    return this._send({
      type: "call_service",
      domain,
      service,
      service_data: serviceData,
    });
  }

  disconnect() {
    if (this.ws) {
      this.onClose = null;
      this.ws.close();
      this.ws = null;
    }
  }
}

window.HAClient = HAClient;
