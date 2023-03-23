import { Modal, Steps } from 'antd';
import React, { PropsWithChildren, useState } from 'react';

interface CreateNewAccountModalProps {
  modalVisible: boolean;
  onCancel: () => void;
}

const steps = [
  {
    title: 'First',
    content: (<div>
    </div>),
  },
  {
    title: 'Second',
    content: 'Second-content',
  },
  {
    title: 'Last',
    content: 'Last-content',
  },
];

const CreateNewAccountModal: React.FC<PropsWithChildren<CreateNewAccountModalProps>> = (props) => {
  const { modalVisible, onCancel } = props;

  const items = steps.map((item) => ({ key: item.title, title: item.title }));
  const [current, setCurrent] = useState(0);

  return (
    <Modal title={'创建账户'} open={modalVisible} onCancel={onCancel} width={1000}>
      <Steps items={items} current={current}>
      </Steps>
      {steps[current].content}
    </Modal>
  );
};


export default CreateNewAccountModal;