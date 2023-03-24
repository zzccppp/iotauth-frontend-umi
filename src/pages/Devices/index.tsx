import Guide from '@/components/Guide';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Typography } from 'antd';

const DevicesPage: React.FC = () => {
  const { initialState, loading, error, refresh, setInitialState } =
    useModel('@@initialState');

  function isLogin(state?: typeof initialState) {
    if (state?.account?.meta.name) {
      return true;
    } else {
      return false;
    }
  }
  return (
    <PageContainer>
      {isLogin(initialState) ? (
        <div>Haha</div>
      ) : (
        <Typography.Title level={3}>请登录</Typography.Title>
      )}
    </PageContainer>
  );
};

export default DevicesPage;
