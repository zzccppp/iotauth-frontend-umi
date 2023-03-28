import Guide from '@/components/Guide';
import { SwapOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Col, Divider, Input, Row, Tag, Typography } from 'antd';
import { useState } from 'react';
import ChangeAddrModal from './components/ChangeAddrModal';
import { ApiPromise } from '@polkadot/api';
import DeviceList from './components/DeviceList';
import SavedDevices from './components/SavedDevices';

const DevicesPage: React.FC = () => {
  const { initialState, loading, error, refresh, setInitialState } =
    useModel('@@initialState');

  const [nodeAddr, setNodeAddr] = useState('');
  const [inputAddr, setInputAddr] = useState('');
  const [showChangeAddrModal, setShowChangeAddrModal] = useState(false);
  // const [api, setApi] = useState<undefined | ApiPromise>(undefined);

  function isLogin(state?: typeof initialState) {
    if (state?.account?.meta.name) {
      return true;
    } else {
      return false;
    }
  }

  function tag(str?: string) {
    return (
      <>
        <div style={{ fontSize: 'larger' }}>
          已经连接到
          <Tag color="green" style={{ fontSize: 'larger' }}>
            {str}
          </Tag>
        </div>
      </>
    );
  }

  return (
    <PageContainer>
      {isLogin(initialState) ? (
        <>
          <ChangeAddrModal
            modalVisible={showChangeAddrModal}
            onCancel={() => {
              setShowChangeAddrModal(false);
            }}
            onSubmit={(addr, api) => {
              setInitialState({
                ...initialState,
                api: api,
                remoteEndpoint: addr,
              });
              setNodeAddr(addr);
              setShowChangeAddrModal(false);
            }}
          ></ChangeAddrModal>
          <Row gutter={16}>
            <Col>
              {initialState?.api === undefined ? (
                <div style={{ fontSize: 'larger' }}>
                  还未连接到任何区块链节点
                </div>
              ) : (
                tag(initialState.remoteEndpoint)
              )}
            </Col>
            <Col>
              <Button
                type="primary"
                shape="circle"
                icon={<SwapOutlined />}
                onClick={() => {
                  setShowChangeAddrModal(true);
                }}
              />
            </Col>
          </Row>
          <DeviceList></DeviceList>
          <Divider orientation="left">记住的设备</Divider>
          <SavedDevices
            devices={
              initialState?.savedDevices ? initialState?.savedDevices : []
            }
          ></SavedDevices>
        </>
      ) : (
        <Typography.Title level={3}>请登录</Typography.Title>
      )}
    </PageContainer>
  );
};

export default DevicesPage;
