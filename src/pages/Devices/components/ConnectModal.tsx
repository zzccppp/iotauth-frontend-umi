import {
  CheckOutlined,
  LoadingOutlined,
  LockOutlined,
  SendOutlined,
  SmileOutlined,
  SolutionOutlined,
  UngroupOutlined,
  UnlockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Col,
  Descriptions,
  Input,
  Modal,
  Result,
  Row,
  Space,
  Spin,
  StepProps,
  Steps,
  Typography,
} from 'antd';
import React, { PropsWithChildren, useState } from 'react';
import { Device } from './DeviceList';
import { useModel } from '@umijs/max';
import keyring from '@polkadot/ui-keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { MessageInstance } from 'antd/es/message/interface';
import { randomAsNumber } from '@polkadot/util-crypto';

interface ConnectModalProps {
  modalVisible: boolean;
  device: Device;
  messageApi: MessageInstance;
  onCancel: () => void;
  onSave: () => void;
}

interface Credential {
  account: string;
  issue_time: number;
  random: string;
  unique_id: string;
}

const ConnectModal: React.FC<PropsWithChildren<ConnectModalProps>> = (
  props,
) => {
  const { modalVisible, device, onCancel, onSave, messageApi } = props;
  const { initialState, loading, error, refresh, setInitialState } =
    useModel('@@initialState');

  const [paraIDNow, setParaIDNow] = useState<number>(-1);
  const [unlockPassword, setUnlockPassword] = useState<string>('');
  const [unlockBtnLoading, setUnlockBtnLoading] = useState<boolean>(false);
  const [step2Spinning, setStep2Spinning] = useState<boolean>(true);
  const [stepsStatus, setStepsStatus] = useState<
    'wait' | 'process' | 'finish' | 'error'
  >('process');

  const [credential, setCredential] = useState<string>('');
  const [sign, setSign] = useState<string>('');

  const api = initialState?.api;
  const account = initialState?.account;

  if (!api || !account) {
    throw new Error('api or account is null');
  }

  const [pair, setPair] = useState<KeyringPair>(
    keyring.getPair(account.address),
  );

  api.query.parachainInfo.parachainId().then((paraId) => {
    setParaIDNow(paraId.toNumber());
  });

  async function doLocalAuth() {
    if (api && account) {
      const randomNum = randomAsNumber();
      await api.tx.iotAuth
        .requestLocalAuth(device.uniqueId, randomNum)
        .signAndSend(pair, { nonce: -1 });
      const unsub = await api.query.system.events((events) => {
        events.forEach((record) => {
          const { event, phase } = record;
          if (
            event.section == 'iotAuth' &&
            event.method == 'LocalAuthSuccess'
          ) {
            const random = event.data['random'];
            if (random.eq(randomNum)) {
              const acc = event.data['account'];
              const uid = event.data['uniqueId'];
              if (acc.eq(account.address) && uid.eq(device.uniqueId)) {
                messageApi.success(
                  `Received LocalAuthSuccess for ${uid.toHex()}, waiting for LocalAuthCredentialIssued`,
                );
                setCurrent(2);
              }
            }
          } else if (
            event.section == 'iotAuth' &&
            event.method == 'LocalAuthFailed'
          ) {
            const random = event.data['random'];
            if (random.eq(randomNum)) {
              const acc = event.data['account'];
              if (acc.eq(account.address)) {
                messageApi.error('认证失败');
                setStep2Spinning(false);
                setStepsStatus('error');
                unsub();
              }
            }
          } else if (
            event.section == 'iotAuth' &&
            event.method == 'LocalAuthCredentialIssued'
          ) {
            const cred = event.data['credential'];
            const signature = event.data['signature'];
            const paraRemote = event.data['paraRemote'];
            const cred_json: Credential = JSON.parse(cred.toHuman());
            if (
              Number.parseInt(cred_json.random) == randomNum &&
              cred_json.unique_id == device.uniqueId &&
              cred_json.account == account.address &&
              paraRemote == device.paraId
            ) {
              console.log(cred_json);
              setCredential(cred.toHuman());
              setSign(signature.toHex());
              setCurrent(3);
              //   // 验证签名
              //   const verify_result = bob.verify(
              //     credential,
              //     signature,
              //     ca_pubkey,
              //   );
              //   log.info(`Verify result: ${verify_result}`);
              unsub();
            }
          }
        });
      });

      setCurrent(1);
    }
  }

  async function doParaAuth() {
    if (api && account) {
      const randomNum = randomAsNumber();
      await api.tx.iotAuth
        .requestForParachainAuth(device.uniqueId, device.paraId, randomNum)
        .signAndSend(pair, { nonce: -1 });

      const unsub = await api.query.system.events((events) => {
        events.forEach((record) => {
          const { event, phase } = record;
          console.log(event);
          if (
            event.section == 'iotAuth' &&
            event.method == 'ParaAuthRequestSend'
          ) {
            const random = event.data['random'];
            if (random.eq(randomNum)) {
              const acc = event.data['account'];
              const uid = event.data['uniqueId'];
              const para_remote = event.data['paraRemote'];
              console.log(para_remote);
              if (acc.eq(account.address) && uid.eq(device.uniqueId)) {
                messageApi.success(
                  `Received ParaAuthRequestSend for ${uid.toHex()}, waiting for LocalAuthCredentialIssued`,
                );
                setCurrent(2);
              }
            }
          } else if (
            event.section == 'iotAuth' &&
            event.method == 'ParaAuthFailed'
          ) {
            const random = event.data['random'];
            if (random.eq(randomNum)) {
              const acc = event.data['account'];
              if (acc.eq(account.address)) {
                messageApi.error('认证失败');
                setStep2Spinning(false);
                setStepsStatus('error');
                unsub();
              }
            }
          } else if (
            event.section == 'iotAuth' &&
            event.method == 'ParaAuthCredentialIssued'
          ) {
            const cred = event.data['credential'];
            const signature = event.data['signature'];
            const cred_json: Credential = JSON.parse(cred.toHuman());
            if (
              Number.parseInt(cred_json.random) == randomNum &&
              cred_json.unique_id == device.uniqueId &&
              cred_json.account == account.address
            ) {
              console.log(cred_json);
              setCredential(cred.toHuman());
              setSign(signature.toHex());
              setCurrent(3);
              //   // 验证签名
              //   const verify_result = bob.verify(
              //     credential,
              //     signature,
              //     ca_pubkey,
              //   );
              //   log.info(`Verify result: ${verify_result}`);
              unsub();
            }
          }
        });
      });
      setCurrent(1);
    }
  }

  const contents = [
    {
      content: (
        <>
          <Row gutter={16}>
            <Col>
              <Descriptions title='设备信息' bordered>
                <Descriptions.Item label='设备名称'>
                  {device.description}
                </Descriptions.Item>
                <Descriptions.Item label='设备UniqueID'>
                  {device.uniqueId}
                </Descriptions.Item>
                <Descriptions.Item label='设备硬件ID'>
                  {device.hardwareId}
                </Descriptions.Item>
                <Descriptions.Item label='设备所属区块链'>
                  {device.paraId}
                </Descriptions.Item>
                <Descriptions.Item label='当前连接的区块链'>
                  {paraIDNow}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>当前账户状态：</Col>
            <Col>{pair.isLocked ? <LockOutlined /> : <UnlockOutlined />}</Col>
            {!pair.isLocked ? undefined : (
              <>
                <Col>
                  <Input.Password
                    value={unlockPassword}
                    onChange={(e) => {
                      setUnlockPassword(e.target.value);
                    }}
                  ></Input.Password>
                </Col>
                <Col>
                  <Button
                    loading={unlockBtnLoading}
                    onClick={() => {
                      setUnlockBtnLoading(true);
                      try {
                        pair.unlock(unlockPassword);
                      } catch (error) {
                        setUnlockBtnLoading(false);
                        messageApi.error('密码错误');
                        return;
                      }
                      setUnlockBtnLoading(false);
                      messageApi.success('解锁账户成功');
                      setPair(Object.assign({}, pair));
                    }}
                  >
                    解锁
                  </Button>
                </Col>
              </>
            )}
          </Row>
          <Row>
            <Col offset={21}>
              <Button
                onClick={() => {
                  if (pair.isLocked) {
                    messageApi.error('账户未解锁');
                  }
                  if (device.paraId == paraIDNow) {
                    // localAuth
                    doLocalAuth();
                  } else {
                    // paraAuth
                    doParaAuth();
                  }
                }}
              >
                发送请求
              </Button>
            </Col>
          </Row>
        </>
      ),
    },
    {
      content: (
        <>
          <Spin tip='Loading...' spinning={step2Spinning}>
            <Alert
              message='认证失败'
              description='看到此消息则证明当前账户无此设备所有权'
              type='error'
            />
          </Spin>
        </>
      ),
    },
    {
      content: (
        <>
          <Spin tip='Waiting for Credential...' spinning={step2Spinning}>
            <Alert message='等待凭证' description='等待凭证下发' type='info' />
          </Spin>
        </>
      ),
    },
    {
      content: (
        <>
          <Result
            status='success'
            title='认证成功'
            subTitle={
              <>
                <Typography>
                  <Typography.Paragraph>
                    <Typography.Text strong={true}>凭证数据：</Typography.Text>
                    <Typography.Text copyable={true}>
                      {credential}
                    </Typography.Text>
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                    <Typography.Text strong={true}>签名数据：</Typography.Text>
                    <Typography.Text copyable={true}>
                      {sign}
                    </Typography.Text>
                  </Typography.Paragraph>
                </Typography>
              </>
            }
            extra={[
              <Button type='primary' key='console'>
                Go Console
              </Button>,
              <Button key='buy'>Buy Again</Button>,
            ]}
          />
        </>
      ),
    },
  ];

  const [current, setCurrent] = useState(0);
  const [items, setItems] = useState<StepProps[]>([
    {
      title: '发送请求',
      icon: <SendOutlined />,
    },
    {
      title: '链上回应',
      icon: <UngroupOutlined />,
    },
    {
      title: '等待凭证',
      icon: <SolutionOutlined />,
    },
    {
      title: '完成',
      icon: <CheckOutlined />,
    },
  ]);

  return (
    <>
      <Modal
        title={'认证'}
        open={modalVisible}
        onCancel={() => {
          pair.lock();
          setPair(keyring.getPair(account.address));
          onCancel();
        }}
        footer={null}
        width={1000}
        destroyOnClose={true}
        afterClose={() => {
          // reset all status
          setCurrent(0);
          setStepsStatus('process');
          setStep2Spinning(true);
          setUnlockPassword('');
          setCredential('');
          setSign('');
        }}
      >
        <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
          <Steps items={items} current={current} status={stepsStatus}></Steps>
          {contents[current].content}
        </Space>
      </Modal>
    </>
  );
};

export default ConnectModal;
