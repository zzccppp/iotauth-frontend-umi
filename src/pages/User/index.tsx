import { PageContainer, ProCard } from '@ant-design/pro-components';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { useModel } from '@umijs/max';
import { Button, Card, Col, Row, message, Divider, Space, Upload } from 'antd';
import Identicon from '@polkadot/react-identicon';
import {
  DeleteOutlined,
  EllipsisOutlined,
  ImportOutlined,
  SaveOutlined,
  UserAddOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { KeyringAddress } from '@polkadot/ui-keyring/types';
import { useState } from 'react';
import CreateNewAccountModal from '@/pages/User/components/createNewAccountModal';
import RestoreAccountModal from './components/restoreAccountModal';

const { Meta } = Card;

export default () => {
  // const accounts = keyring.getAccounts();
  // const { account, setAccount } = useModel('account');
  const { initialState, loading, error, refresh, setInitialState } =
    useModel('@@initialState');
  const [messageApi, contextHolder] = message.useMessage();

  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] =
    useState(false);

  const [isRestoreAccountModalOpen, setIsRestoreAccountModalOpen] =
    useState(false);

  const [restoreContent, setRestoreContent] = useState('');

  const [accounts, setAccounts] = useState<KeyringAddress[]>(
    keyring.getAccounts(),
  );

  const acc = accounts.map((item) => {
    return (
      <Col span={12} key={item.address}>
        <Card
          actions={[
            <UserSwitchOutlined
              key="switch"
              onClick={() => {
                setInitialState({
                  ...initialState,
                  account: item,
                });
                messageApi.success(
                  '成功切换到' + item.meta.name?.toUpperCase() + '账户',
                );
              }}
            />,
            <DeleteOutlined
              key="delete"
              onClick={() => {
                keyring.forgetAccount(item.address);
                messageApi.success('删除成功');
                setAccounts(keyring.getAccounts());
              }}
            />,
            <SaveOutlined key="edit" onClick={() => {}} />,
            <EllipsisOutlined key="ellipsis" />,
          ]}
        >
          <Meta
            avatar={
              <Identicon
                value={item.address}
                size={32}
                theme={'substrate'}
              ></Identicon>
            }
            title={item.meta.name?.toUpperCase()}
            description={item.address}
          />
          {/* <div> {u8aToHex(item.publicKey)}</div> */}
        </Card>
      </Col>
    );
  });

  return (
    <PageContainer>
      {contextHolder}
      <CreateNewAccountModal
        modalVisible={isCreateAccountModalOpen}
        onCancel={() => {
          console.log('cancel');
          setIsCreateAccountModalOpen(false);
        }}
        onSave={() => {
          messageApi.success('添加成功');
          setIsCreateAccountModalOpen(false);
          setAccounts(keyring.getAccounts());
        }}
      ></CreateNewAccountModal>
      <RestoreAccountModal
        modalVisible={isRestoreAccountModalOpen}
        onCancel={() => {
          setIsRestoreAccountModalOpen(false);
        }}
        onSubmit={() => {
          setAccounts(keyring.getAccounts());
          setIsRestoreAccountModalOpen(false);
          messageApi.success('恢复成功');
        }}
        content={restoreContent}
      ></RestoreAccountModal>
      <Space>
        <Button
          type="primary"
          shape="round"
          icon={<UserAddOutlined />}
          size="large"
          onClick={() => {
            setIsCreateAccountModalOpen(true);
          }}
        >
          Add Account
        </Button>
        <Upload
          accept=".json"
          showUploadList={false}
          beforeUpload={(file, _) => {
            const reader = new FileReader();

            reader.onload = (event) => {
              const content = event.target?.result;
              if (typeof content === 'string') {
                setRestoreContent(content);
                setIsRestoreAccountModalOpen(true);
              } else {
                messageApi.error('请上传正确的json文件');
              }
            };
            reader.readAsText(file);
            return false;
          }}
        >
          <Button
            type="primary"
            shape="round"
            icon={<ImportOutlined />}
            size="large"
            onClick={() => {}}
          >
            Import Account
          </Button>
        </Upload>
      </Space>
      <Divider dashed>当前保存的用户</Divider>
      <Row gutter={16}>{acc}</Row>
    </PageContainer>
  );
};
