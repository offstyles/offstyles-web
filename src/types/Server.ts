export interface ServerActivityDocument {
  server: string;
  active: boolean;
  ips: string[];
}

export interface KeyReturnJson {
  key: string;
}