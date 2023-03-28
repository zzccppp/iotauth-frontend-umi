import React, { PropsWithChildren, useState } from 'react';
import { Device } from './DeviceList';
import { Avatar, Card, Col, Space, Typography, message } from 'antd';
import {
  ApiOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { MessageInstance } from 'antd/es/message/interface';
import { randomAsNumber } from '@polkadot/util-crypto';
import keyring from '@polkadot/ui-keyring';
import PasswordInputModal from './PasswordInputModal';
import { KeyringPair } from '@polkadot/keyring/types';
import ConnectModal from './ConnectModal';

interface DeviceCardProps {
  device: Device;
  messageApi: MessageInstance;
}

const DeviceCard: React.FC<PropsWithChildren<DeviceCardProps>> = (props) => {
  const { device, messageApi } = props;
  const { initialState, loading, error, refresh, setInitialState } =
    useModel('@@initialState');
  const [showCM, setShowCM] = useState<boolean>(false);

  const api = initialState?.api;
  const account = initialState?.account;

  // async function doAuth(pair: KeyringPair) {
  //   if (api) {
  //     setShowCM(true);
  //     await api.tx.iotAuth
  //       .requestLocalAuth(device.uniqueId, randomAsNumber())
  //       .signAndSend(pair, { nonce: -1 });
  //   }
  //   pair.lock();
  // }

  return (
    <>
      <ConnectModal
        device={device}
        modalVisible={showCM}
        messageApi={messageApi}
        onCancel={() => {
          setShowCM(false);
        }}
        onSave={function (): void {
          throw new Error('Function not implemented.');
        }}
      ></ConnectModal>
      <Card
        actions={[
          <ApiOutlined
            key="auth"
            onClick={async () => {
              // if (api && account) {
              //   const pair = keyring.getPair(account.address);
              //   if (pair.isLocked) {
              //     setShowPIM(true);
              //     return;
              //   }
              //   doAuth(pair);
              // }
              setShowCM(true);
            }}
          />,
          <DeleteOutlined
            key="delete"
            hidden={true}
            onClick={() => {
              const savedDevices = initialState?.savedDevices;
              if (savedDevices) {
                if (
                  !savedDevices.find(
                    (item) =>
                      item.uniqueId === device.uniqueId &&
                      item.paraId === device.paraId,
                  )
                ) {
                  messageApi.error('设备未保存');
                  return;
                }
                const newSavedDevices = savedDevices.filter(
                  (item) => item.uniqueId !== device.uniqueId,
                );
                messageApi.success('删除成功');
                setInitialState({
                  ...initialState,
                  savedDevices: newSavedDevices,
                });
              }
            }}
          />,
          <SaveOutlined
            key="save"
            onClick={() => {
              const savedDevices = initialState?.savedDevices;
              if (savedDevices) {
                if (
                  savedDevices.find(
                    (item) =>
                      item.uniqueId === device.uniqueId &&
                      item.paraId === device.paraId,
                  )
                ) {
                  messageApi.error('设备已保存');
                  return;
                } else {
                  const newSavedDevices = [device, ...savedDevices];
                  messageApi.success('保存成功');
                  setInitialState({
                    ...initialState,
                    savedDevices: newSavedDevices,
                  });
                }
              }
            }}
          />,
          <EllipsisOutlined key="ellipsis" />,
        ]}
      >
        <Space direction="vertical">
          <Card.Meta
            avatar={
              <Avatar
                style={{ backgroundColor: '#7265e6', verticalAlign: 'middle' }}
                size="large"
              >
                {device.description}
              </Avatar>
            }
            title={device.description}
            description={'ParaId: ' + device.paraId}
          />
          <Typography>
            <Typography.Text strong>{'UniqueID: '} </Typography.Text>
            <Typography.Text type={'warning'}>
              {device.uniqueId}
            </Typography.Text>
          </Typography>
        </Space>
      </Card>
    </>
  );
};

export default DeviceCard;
