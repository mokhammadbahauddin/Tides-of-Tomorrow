export interface TemperatureRecord {
  year: number;
  anomaly: number;
  isElNino: boolean;
  elNinoStrength: 'none' | 'moderate' | 'strong' | 'very-strong';
}