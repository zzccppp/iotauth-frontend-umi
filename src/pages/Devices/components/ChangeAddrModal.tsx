import React, { PropsWithChildren, useState } from 'react';
import { Input, Modal, message } from 'antd';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { useModel } from '@umijs/max';

interface ChangeAddrModalProps {
  onCancel: () => void;
  onSubmit: (addr: string, api: ApiPromise) => void;
  modalVisible: boolean;
}

const ChangeAddrModal: React.FC<PropsWithChildren<ChangeAddrModalProps>> = (
  props,
) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [addr, setAddr] = useState('');
  const { modalVisible, onCancel, onSubmit } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { initialState, loading, error, refresh, setInitialState } =
    useModel('@@initialState');

  return (
    <Modal
      title={'更改区块链节点'}
      open={modalVisible}
      onOk={async () => {
        setConfirmLoading(true);
        let wsProvider;
        try {
          wsProvider = new WsProvider(addr);
        } catch (_) {
          messageApi.error('切换失败，请检查地址是否正确');
          setConfirmLoading(false);
          return;
        }
        const api = new ApiPromise({ provider: wsProvider });

        api.on('error', () => {
          api.disconnect();
          setInitialState({
            ...initialState,
            api: undefined,
            remoteEndpoint: '',
          });
          messageApi.error('连接失败，请检查地址与网络环境');
          setConfirmLoading(false);
          console.log('Error with Polkadot node');
        });

        api.on('connected', () => {
          console.log('Connected to Polkadot node');
        });

        api.on('disconnected', () => {
          console.log('Disconnected from Polkadot node');
        });

        api.on('ready', () => {
          messageApi.success('成功连接到节点' + addr);
          setConfirmLoading(false);
          onSubmit(addr, api);
        });

        // try {
        //   const wsProvider = new WsProvider(addr);
        //   const api = await ApiPromise.create({
        //     provider: wsProvider,
        //     throwOnConnect: true,
        //   });
        //   await api.isReady;
        //   console.log('ready');
        //   // api.disconnect();
        // } catch (error) {
        //   messageApi.error('切换失败，请检查地址是否正确');
        //   setConfirmLoading(false);
        // }
      }}
      onCancel={() => {
        onCancel();
      }}
      confirmLoading={confirmLoading}
    >
      {contextHolder}
      <Input
        value={addr}
        onChange={(event) => {
          setAddr(event.target.value);
        }}
      ></Input>
    </Modal>
  );
};

export default ChangeAddrModal;
