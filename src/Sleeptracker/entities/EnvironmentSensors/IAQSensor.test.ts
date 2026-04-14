import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { mocked, testDevice } from '@utils/testHelpers';
import { mock } from 'jest-mock-extended';
import { IAQSensor } from './IAQSensor';

const mqtt: IMQTTConnection = mock<IMQTTConnection>();
const buildSubject = () => new IAQSensor(mqtt, testDevice);

describe(IAQSensor.name, () => {
  beforeAll(() => jest.useFakeTimers());

  beforeEach(jest.resetAllMocks);

  describe('publishes discovery', () => {
    beforeEach(() => {
      mocked(mqtt.on).mockImplementation((_topic, _func) => undefined);

      buildSubject();
      jest.runAllTimers();
    });

    it('on construction with correct device_class and icon', () => {
      expect(mqtt.publish).toBeCalledWith('homeassistant/sensor/device_topic_iaq_sensor/config', {
        availability_topic: 'device_topic/iaq_sensor/status',
        device: { ...testDevice.device },
        name: 'IAQ Sensor',
        payload_available: 'online',
        payload_not_available: 'offline',
        state_topic: 'device_topic/iaq_sensor/state',
        unique_id: 'test_name_iaq_sensor',
        json_attributes_topic: 'device_topic/iaq_sensor/state',
        value_template: "{{ value_json.value | default('') }}",
        state_class: 'measurement',
        device_class: 'aqi',
        icon: 'mdi:air-filter',
      });
    });
  });

  describe('call setState', () => {
    const entity = buildSubject();

    it('publishes state when setState called with iaq data', () => {
      const state = { type: 'iaq' as const, value: 72.8, lastUpdatedGMTSecs: 1776196624 };
      entity.setState(state);
      jest.runAllTimers();
      // cleanJsonState transforms lastUpdatedGMTSecs -> lastUpdated (ISO string)
      expect(mqtt.publish).toBeCalledWith('device_topic/iaq_sensor/state', {
        type: 'iaq',
        value: 72.8,
        lastUpdated: new Date(1776196624 * 1000).toISOString(),
      });
    });

    it('publishes available offline when setState called with null', () => {
      entity.setState(null);
      jest.runAllTimers();
      expect(mqtt.publish).toBeCalledWith('device_topic/iaq_sensor/status', 'offline');
      expect(mqtt.publish).not.toBeCalledWith('device_topic/iaq_sensor/state', null);
    });
  });
});
