import { Button, Icon, SwModal } from 'components/design-system-ui';
import { View } from 'react-native';
import i18n from 'utils/i18n/i18n';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { UseControllerProps } from 'react-hook-form/dist/types/controller';
import { FormItem } from 'components/common/FormItem';
import Input from 'components/design-system-ui/input';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { editContactAddress, removeContactAddress } from 'messaging/index';
import { AddressJson } from '@subwallet/extension-base/background/types';
import { ReadonlyAddressField } from 'components/Modal/AddressBook/ReadonlyAddressField';
import { Trash } from 'phosphor-react-native';
import useConfirmModal from 'hooks/modal/useConfirmModal';
import DeleteModal from 'components/common/Modal/DeleteModal';
import ToastContainer, { useToast } from 'react-native-toast-notifications';
import createStylesheet from './style/EditContactModal';

type Props = {
  addressJson: AddressJson;
  modalVisible: boolean;
  onChangeModalVisible: () => void;
};

enum FormFieldName {
  NAME = 'name',
}

interface FormValues {
  [FormFieldName.NAME]: string;
}

export const EditContactModal = ({ modalVisible, onChangeModalVisible, addressJson }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { address, name: defaultName = '' } = addressJson;
  const contacts = useSelector((state: RootState) => state.accountState.contacts);
  const [loading, setLoading] = useState(false);
  const { show, hideAll } = useToast();
  const toastRef = useRef<ToastContainer>(null);
  const stylesheet = createStylesheet(theme);

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      [FormFieldName.NAME]: defaultName,
    },
  });

  const { name: nameValue } = {
    ...useWatch<FormValues>({ control }),
    ...getValues(),
  };

  const existNames = useMemo(
    () =>
      contacts
        .filter(contact => contact.address !== addressJson.address)
        .map(contact => (contact.name || '').trimStart().trimEnd()),
    [contacts, addressJson.address],
  );

  const nameValidator: UseControllerProps<FormValues>['rules'] = useMemo(
    () => ({
      validate: name => {
        if (!name) {
          return i18n.errorMessage.contactNameIsRequired;
        }

        if (existNames.includes(name)) {
          return i18n.errorMessage.contactNameMustBeUnique;
        }

        return true;
      },
    }),
    [existNames],
  );

  const onSubmit = useCallback(
    (values: FormValues) => {
      const { [FormFieldName.NAME]: _name } = values;

      const name = _name.trimStart().trimEnd();

      setLoading(true);
      editContactAddress(address, name)
        .then(() => {
          onChangeModalVisible();
        })
        .catch((e: Error) => {
          hideAll();
          show(e.message);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [address, hideAll, onChangeModalVisible, show],
  );

  const handeDelete = () => {
    setLoading(true);
    removeContactAddress(address).finally(() => {
      setLoading(false);
      onChangeModalVisible();
    });
  };

  const isSaveDisabled = (() => {
    if (!(dirtyFields && dirtyFields[FormFieldName.NAME])) {
      return true;
    }

    if (loading || !nameValue.trim()) {
      return true;
    }

    if (errors && Object.keys(errors).length) {
      return true;
    }

    return false;
  })();

  const {
    onPress: onPressDelete,
    onCancelModal: onCancelDelete,
    visible: deleteVisible,
    onCompleteModal: onCompleteDelete,
  } = useConfirmModal(handeDelete);

  useEffect(() => {
    reset({
      [FormFieldName.NAME]: defaultName,
    });
  }, [reset, modalVisible, defaultName]);

  return (
    <>
      <ToastContainer ref={toastRef} placement="top" />
      <SwModal
        modalTitle={i18n.header.editContact}
        modalVisible={modalVisible}
        onChangeModalVisible={onChangeModalVisible}>
        <View style={stylesheet.formContainer}>
          <FormItem
            control={control}
            rules={nameValidator}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                placeholder={i18n.addressBook.contactName}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                label={i18n.addressBook.contactName}
                onSubmitEditing={handleSubmit(onSubmit)}
                ref={ref}
              />
            )}
            name={FormFieldName.NAME}
          />

          <ReadonlyAddressField address={address} label={i18n.addressBook.contactAddress} />

          <View style={stylesheet.buttonGroupContainer}>
            <Button
              disabled={loading}
              type={'danger'}
              onPress={onPressDelete}
              icon={
                <Icon
                  phosphorIcon={Trash}
                  weight={'fill'}
                  size={'lg'}
                  iconColor={loading ? theme.colorTextLight4 : undefined}
                />
              }
            />
            <Button disabled={loading} type={'secondary'} style={stylesheet.button} onPress={onChangeModalVisible}>
              {i18n.common.cancel}
            </Button>
            <Button disabled={isSaveDisabled || loading} style={stylesheet.button} onPress={handleSubmit(onSubmit)}>
              {i18n.common.save}
            </Button>
          </View>
        </View>

        <DeleteModal
          title={i18n.confirmation.deleteContactTitle}
          visible={deleteVisible}
          message={i18n.confirmation.deleteContactMessage}
          onCompleteModal={onCompleteDelete}
          onCancelModal={onCancelDelete}
        />
      </SwModal>
    </>
  );
};