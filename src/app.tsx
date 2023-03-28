import { UserOutlined } from '@ant-design/icons';
import { ApiPromise } from '@polkadot/api';
import Identicon from '@polkadot/react-identicon';
import keyring, { Keyring } from '@polkadot/ui-keyring';
import { KeyringAddress } from '@polkadot/ui-keyring/types';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { Avatar, Space } from 'antd';
import { Device } from './pages/Devices/components/DeviceList';

interface InitialStateProps {
  account?: KeyringAddress;
  api?: ApiPromise;
  remoteEndpoint?: string;
  savedDevices?: Device[];
}

// 运行时配置
// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<InitialStateProps> {
  await cryptoWaitReady();
  keyring.loadAll({ ss58Format: 42, type: 'sr25519', isDevelopment: true });
  return {
    account: undefined,
    api: undefined,
    remoteEndpoint: '',
    savedDevices: [],
  };
}

export const layout = () => {
  return {
    logo: 'https://polkadot.js.org/logo.svg',
    menu: {
      locale: false,
    },
    navTheme: 'light',
    primaryColor: '#FAAD14',
    layout: 'top',
    contentWidth: 'Fixed',
    fixedHeader: false,
    fixSiderbar: true,
    pwa: false,
    headerHeight: 48,
    splitMenus: false,
    rightRender: (initialState: any, setInitialState: any) => {
      if (initialState.account) {
        return (
          <Space>
            <Avatar
              size={32}
              icon={
                <Identicon
                  value={initialState.account.address}
                  theme={'substrate'}
                  size={32}
                ></Identicon>
              }
            ></Avatar>
            {initialState.account.meta.name.toUpperCase()}
          </Space>
        );
      } else {
        return (
          <Space>
            <Avatar size={32} icon={<UserOutlined />} />
            请登录
          </Space>
        );
      }
    },
  };
};
