import {
  ConsoleSqlOutlined,
  CopyOutlined,
  LockOutlined,
  SaveOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Steps,
  Tag,
  Typography,
  message,
} from 'antd';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { mnemonicGenerate, mnemonicValidate } from '@polkadot/util-crypto';
import { InputStatus } from 'antd/es/_util/statusUtils';
import keyring from '@polkadot/ui-keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import Identicon from '@polkadot/react-identicon';

interface CreateNewAccountModalProps {
  modalVisible: boolean;
  onCancel: () => void;
  onSave: () => void;
}

const CreateNewAccountModal: React.FC<
  PropsWithChildren<CreateNewAccountModalProps>
> = (props) => {
  const { modalVisible, onCancel, onSave } = props;

  const [mnemonic, setMnemonic] = useState(mnemonicGenerate(12));
  const [mnemonicStatus, setMnemonicStatus] = useState<InputStatus>('');
  const [usernameStatus, setUsernameStatus] = useState<InputStatus>('');
  const [passwordStatus, setPasswordStatus] = useState<InputStatus>('');
  const [messageApi, contextHolder] = message.useMessage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pair, setPair] = useState<KeyringPair | undefined>(undefined);

  function validateUsername(un: string) {
    if (un.length >= 3) {
      setUsernameStatus('');
      return true;
    } else {
      setUsernameStatus('error');
      return false;
    }
  }

  function validatePassword(pwd: string) {
    if (pwd.length >= 6) {
      setPasswordStatus('');
      return true;
    } else {
      setPasswordStatus('error');
      return false;
    }
  }

  function handleSave(jsonString: string, filename?: string) {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const steps = [
    {
      title: 'First',
      content: (
        <>
          <Row gutter={16}>
            <Col>
              <Typography.Title level={4}>
                你应该妥善保存该助记词，以便恢复账户
              </Typography.Title>
            </Col>
            <Col span={23}>
              <Input
                size="large"
                prefix={<Tag color="cyan">mnemonic</Tag>}
                value={mnemonic}
                status={mnemonicStatus}
                onChange={(event) => {
                  setMnemonic(event.target.value);
                  if (!mnemonicValidate(event.target.value)) {
                    setMnemonicStatus('error');
                  } else {
                    setMnemonicStatus('');
                  }
                }}
              />
            </Col>
            <Col span={1}>
              <Button
                type="dashed"
                shape="circle"
                icon={<CopyOutlined />}
                size="large"
                onClick={() => {
                  messageApi.success('copy success');
                  navigator.clipboard.writeText(mnemonic);
                }}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col offset={22} span={1}>
              <Button
                type="primary"
                icon={<StepForwardOutlined />}
                size="large"
                onClick={() => {
                  if (!mnemonicValidate(mnemonic)) {
                    setMnemonicStatus('error');
                  } else {
                    setMnemonicStatus('');
                    setCurrent(1);
                  }
                }}
              ></Button>
            </Col>
          </Row>
        </>
      ),
    },
    {
      title: 'Second',
      content: (
        <>
          <Row gutter={16}>
            <Col>
              <Typography.Title level={4}>填写账户名称和密码</Typography.Title>
            </Col>
          </Row>
          <Row>
            <Col>
              <Input
                size={'large'}
                prefix={<UserOutlined />}
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  validateUsername(event.target.value);
                }}
                status={usernameStatus}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <Input.Password
                size={'large'}
                prefix={<LockOutlined />}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  validatePassword(event.target.value);
                }}
                status={passwordStatus}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col offset={20} span={1}>
              <Button
                type="primary"
                icon={<StepBackwardOutlined />}
                size="large"
                onClick={() => {
                  setCurrent(0);
                }}
              ></Button>
            </Col>
            <Col offset={1} span={1}>
              <Button
                type="primary"
                icon={<StepForwardOutlined />}
                size="large"
                onClick={() => {
                  if (
                    validateUsername(username) &&
                    validatePassword(password)
                  ) {
                    const pair = keyring.createFromUri(
                      mnemonic,
                      { name: username },
                      'sr25519',
                    );
                    setPair(pair);
                    setCurrent(2);
                  }
                }}
              ></Button>
            </Col>
          </Row>
        </>
      ),
    },
    {
      title: 'Last',
      content: (
        <>
          <Row gutter={16}>
            <Col>
              <Typography.Title level={4}>账户信息</Typography.Title>
            </Col>
          </Row>

          <Row>
            <Col span={1}>
              {pair && (
                <Identicon
                  value={pair.address}
                  size={32}
                  theme={'substrate'}
                ></Identicon>
              )}
            </Col>
            <Col span={1}>
              <Typography.Text strong>{username.toUpperCase()}</Typography.Text>
            </Col>
            <Col>
              <Typography.Text>{pair?.address}</Typography.Text>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col offset={20} span={1}>
              <Button
                type="primary"
                icon={<StepBackwardOutlined />}
                size="large"
                onClick={() => {
                  setCurrent(1);
                }}
              ></Button>
            </Col>
            <Col offset={1} span={1}>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                size="large"
                onClick={() => {
                  if (pair) {
                    const jsonData = keyring.saveAccount(pair, password);
                    handleSave(JSON.stringify(jsonData), pair.address + ".json");
                    onSave();
                  }
                }}
              ></Button>
            </Col>
          </Row>
        </>
      ),
    },
  ];

  const items = steps.map((item) => ({ key: item.title, title: item.title }));
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (modalVisible == true) {
      setMnemonic(mnemonicGenerate(12));
    }
  }, [modalVisible]);

  return (
    <Modal
      title={'通过种子添加账户'}
      open={modalVisible}
      onCancel={() => {
        onCancel();
      }}
      footer={null}
      width={1000}
      destroyOnClose={true}
      afterClose={() => {
        setMnemonic('');
        setCurrent(0);
        setMnemonicStatus('');
        setUsernameStatus('');
        setPasswordStatus('');
        setPassword('');
        setUsername('');
      }}
    >
      {contextHolder}
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Steps items={items} current={current}></Steps>
        {steps[current].content}
      </Space>
    </Modal>
  );
};

export default CreateNewAccountModal;
