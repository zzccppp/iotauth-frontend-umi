import keyring from '@polkadot/ui-keyring';
import { Input, Modal, message } from 'antd';
import React, { PropsWithChildren, useState } from 'react';

interface RestoreAccountModalProps {
  modalVisible: boolean;
  content: string;
  onCancel: () => void;
  onSubmit: () => void;
}

const RestoreAccountModal: React.FC<
  PropsWithChildren<RestoreAccountModalProps>
> = (props) => {
  const { modalVisible, content, onCancel, onSubmit } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [pass, setPass] = useState('');
  return (
    <Modal
      title="读取文件成功，请输入账户密码"
      open={modalVisible}
      onOk={() => {
        try {
          const _keypair = keyring.restoreAccount(JSON.parse(content), pass);
        } catch (error) {
          messageApi.error('密码错误');
          return;
        }
        onSubmit();
      }}
      onCancel={() => {
        onCancel();
      }}
      afterClose={() => {
        setPass('');
      }}
      destroyOnClose={true}
    >
      {contextHolder}
      <Input.Password
        placeholder="input password"
        value={pass}
        onChange={(e) => {
          setPass(e.target.value);
        }}
      />
    </Modal>
  );
};

export default RestoreAccountModal;
