export interface ServerActivityDocument {
  server: string;
  active: boolean;
  ips: string[];
}

export interface KeyReturnJson {
  key: string;
}

// New interfaces for server management
export interface ServerInfo {
  name: string;
  ip: string;
  whitelist: boolean;
}

export interface ServerDataDocument {
  _id?: string; // Optional since it can be None in Rust
  key_ref: string;
  owner_ref?: string; // Optional since it can be None in Rust
  name: string;
  servers: ServerInfo[];
}
