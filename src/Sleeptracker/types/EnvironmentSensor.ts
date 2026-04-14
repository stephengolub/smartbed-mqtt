export type EnvironmentSensorType = 'degreesCelsius' | 'humidityPercentage' | 'co2Ppm' | 'vocPpb' | 'iaq';
export type EnvironmentSensorData = {
  type: EnvironmentSensorType;
  lastUpdatedGMTSecs: number;
  value: number;
};
