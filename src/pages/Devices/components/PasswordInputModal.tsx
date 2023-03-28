import keyring from '@polkadot/ui-keyring';
import { Input, Modal, message } from 'antd';
import React, { PropsWithChildren, useState } from 'react';

interface PasswordInputModalProps {
  modalVisible: boolean;
  onCancel: () => void;
  onSubmit: (pass: string) => void;
}

const PasswordInputModal: React.FC<
  PropsWithChildren<PasswordInputModalProps>
> = (props) => {
  const { modalVisible, onCancel, onSubmit } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [pass, setPass] = useState('');
  return (
    <Modal
      title="请输入密码解锁账户"
      open={modalVisible}
      onOk={() => {
        onSubmit(pass);
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

export default PasswordInputModal;
