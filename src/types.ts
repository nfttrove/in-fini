export interface CasimirParams {
  plateSeparation: number;
  plateArea: number;
}

export interface RotatingFieldParams {
  frequency: number;
  amplitude: number;
  cavityLength: number;
  time: number;
}

export interface CavityModeParams {
  cavityLength: number;
  modeNumber: number;
  drivingFrequency: number;
}

export interface SimulationTab {
  id: string;
  label: string;
  description: string;
}
