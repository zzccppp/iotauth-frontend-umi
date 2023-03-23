import { Modal, Steps } from 'antd';
import React, { PropsWithChildren, PropsWithRef, useState } from 'react';

interface CreateFormProps {
  modalVisible: boolean;
  onCancel: () => void;
}


const CreateForm: React.FC<PropsWithRef<CreateFormProps>> = (props) => {
  const { modalVisible, onCancel } = props;

  return (
    <Modal
      destroyOnClose
      title='新建'
      width={600}
      open={modalVisible}
      onCancel={() => {
        //TODO do clear work
        onCancel();
      }}
      footer={null}
    >
    </Modal>
  );
};

export default CreateForm;
