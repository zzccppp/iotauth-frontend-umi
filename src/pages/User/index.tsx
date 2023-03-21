import { PageContainer, ProCard } from '@ant-design/pro-components';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { useModel } from '@umijs/max';
import { Button, Card, Col, Row, message } from 'antd';
import Identicon from '@polkadot/react-identicon';
import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { KeyringAddress } from '@polkadot/ui-keyring/types';

const { Meta } = Card;

function testClick(sdf: any) {
  console.log(sdf);
}

export default () => {
  const accounts = keyring.getAccounts();
  // const { account, setAccount } = useModel('account');
  const { initialState, loading, error, refresh, setInitialState } =
    useModel('@@initialState');
  const [messageApi, contextHolder] = message.useMessage();

  const acc = accounts.map((item) => {
    return (
      <Col span={12} key={item.address}>
        {contextHolder}
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
            <SettingOutlined key="setting" />,
            <EditOutlined key="edit" />,
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
      <Button onClick={() => testClick('')}>Test Button</Button>
      <Row gutter={16}>{acc}</Row>
    </PageContainer>
  );
};
