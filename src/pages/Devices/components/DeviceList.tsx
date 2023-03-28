import React, { PropsWithChildren, useState } from 'react';
import { useModel } from '@umijs/max';
import { Avatar, Card, Col, Divider, Row, message } from 'antd';
import {
  ApiOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  SaveOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import DeviceCard from './DeviceCard';

export interface Device {
  uniqueId: string;
  description: string;
  hardwareId: string;
  paraId: number;
}

const DeviceList: React.FC<PropsWithChildren> = (props) => {
  const { initialState, loading, error, refresh, setInitialState } =
    useModel('@@initialState');

  const [devices, setDevices] = useState<Device[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  async function getDevices() {
    const api = initialState?.api;
    const account = initialState?.account;
    if (api && account) {
      const inf = await api.query.iotAuth.iotDeviceMap.multi(
        await api.query.iotAuth.ownerOfCollectibles(account.address),
      );
      const paraId = await api.query.parachainInfo.parachainId();
      const devs = inf.map((item) => {
        const device = item.unwrap();
        const dev: Device = {
          uniqueId: device['uniqueId'].toHex(),
          description: device['description'].toHuman(),
          hardwareId: device['hardwareId'].toHex(),
          paraId: paraId.toNumber(),
        };
        return dev;
      });
      setDevices(devs);
    }
  }

  const devicesCard = devices.map((item) => {
    return (
      <Col span={12} key={item.uniqueId}>
        <DeviceCard device={item} messageApi={messageApi}></DeviceCard>
      </Col>
    );
  });

  getDevices();

  return (
    <>
      {contextHolder}
      <Divider orientation="left">当前链上的设备</Divider>
      <Row gutter={16}>{devicesCard}</Row>
    </>
  );
};

export default DeviceList;
