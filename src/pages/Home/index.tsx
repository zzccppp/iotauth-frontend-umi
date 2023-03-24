import Guide from '@/components/Guide';
import { trim } from '@/utils/format';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import styles from './index.less';

const HomePage: React.FC = () => {
  const { name } = useModel('global');
  const { initialState, loading, error, refresh, setInitialState } =
    useModel('@@initialState');

  function getName(state?: typeof initialState) {
    if (state?.account?.meta.name) {
      return <Guide name={state.account.meta.name.toUpperCase()}></Guide>;
    } else {
      return <Guide name={'请登录'}></Guide>;
    }
  }
  return (
    <PageContainer ghost>
      <div className={styles.container}>
        {/* <Guide name={name} /> */}
        {getName(initialState)}
      </div>
    </PageContainer>
  );
};

export default HomePage;
