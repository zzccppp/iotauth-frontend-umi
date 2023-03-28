import React, { PropsWithChildren, useState } from 'react';
import { useModel } from '@umijs/max';
import { Avatar, Card, Col, Divider, Row, message } from 'antd';
import DeviceCard from './DeviceCard';
import { Device } from './DeviceList';

interface SavedDevicesProps {
  devices: Device[];
}

const SavedDevices: React.FC<PropsWithChildren<SavedDevicesProps>> = (
  props,
) => {
  const { devices } = props;
  const [messageApi, contextHolder] = message.useMessage();

  const devicesCard = devices.map((item) => {
    return (
      <Col span={12} key={item.uniqueId}>
        <DeviceCard device={item} messageApi={messageApi}></DeviceCard>
      </Col>
    );
  });

  return (
    <>
      {contextHolder}
      <Row gutter={16}>{devicesCard}</Row>
    </>
  );
};

export default SavedDevices;
