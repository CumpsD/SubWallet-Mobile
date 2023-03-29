import React, {useCallback, useMemo, useState} from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { StyleProp, View } from 'react-native';
import { CheckCircle, Info } from 'phosphor-react-native';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSemiBold, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import { PasswordField } from 'components/Field/Password';
import i18n from 'utils/i18n/i18n';
import { validatePassword, validatePasswordMatched } from 'screens/Shared/AccountNamePasswordCreation';
import { Warning } from 'components/Warning';
import { keyringChangeMasterPassword } from '../../messaging';
import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import { CreatePasswordProps, RootNavigationProps } from 'routes/index';
import {requestCameraPermission} from "utils/permission/camera";
import {RESULTS} from "react-native-permissions";
import {SCAN_TYPE} from "constants/qr";
import {HIDE_MODAL_DURATION} from "constants/index";
import QrAddressScanner from "components/Scanner/QrAddressScanner";
import useModalScanner from "hooks/qr/useModalScanner";
import {QrAccount} from "types/qr/attach";
import * as assert from "assert";
import {AttachAccountStackParamList} from "routes/account/attachAccount";

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
  marginHorizontal: 16,
  ...MarginBottomForSubmitButton,
};

const formConfig: FormControlConfig = {
  password: {
    name: i18n.common.walletPassword,
    value: '',
    validateFunc: validatePassword,
    require: true,
  },
  repeatPassword: {
    name: i18n.common.repeatWalletPassword,
    value: '',
    validateFunc: (value: string, formValue: Record<string, string>) => {
      return validatePasswordMatched(value, formValue.password);
    },
    require: true,
  },
};

function checkValidateForm(isValidated: Record<string, boolean>) {
  return isValidated.password && isValidated.repeatPassword;
}

const CreateMasterPassword = ({
  route: {
    params: { pathName, state },
  },
}: CreatePasswordProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const [isBusy, setIsBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [scanType, setScanType] = useState<SCAN_TYPE.QR_SIGNER | SCAN_TYPE.SECRET>(SCAN_TYPE.SECRET);

  const onSuccess = useCallback(
    (data: QrAccount) => {
      switch (scanType) {
        case SCAN_TYPE.QR_SIGNER:
          navigation.navigate('AttachAccount', {
            screen: 'AttachQrSignerConfirm',
            params: data,
          });
          break;
        case SCAN_TYPE.SECRET:
          navigation.navigate('AttachAccount', {
            screen: 'ImportAccountQrConfirm',
            params: data,
          });
          break;
        default:
          break;
      }
    },
    [navigation, scanType],
  );

  const { onOpenModal, onScan, isScanning, onHideModal } = useModalScanner(onSuccess);

  const onComplete = async () => {
    if (pathName === 'ScanByQrCode' || pathName === 'AttachQR-signer') {
      const result = await requestCameraPermission();

      if (result === RESULTS.GRANTED) {
        if (pathName === 'ScanByQrCode') {
          setScanType(SCAN_TYPE.SECRET);
          setTimeout(() => {
            onOpenModal();
          }, HIDE_MODAL_DURATION);
        } else {
          setScanType(SCAN_TYPE.QR_SIGNER);
          setTimeout(() => {
            onOpenModal();
          }, HIDE_MODAL_DURATION);
        }
      }
    } else if (pathName === 'AttachAccount') {
      // @ts-ignore
      navigation.navigate(pathName, { screen: state });
    } else if (pathName === 'CreateAccount') {
      navigation.navigate(pathName, {});
    } else {
      navigation.navigate(pathName);
    }
  };

  const onSubmit = () => {
    if (checkValidateForm(formState.isValidated)) {
      const password = formState.data.password;

      if (password) {
        setIsBusy(true);
        keyringChangeMasterPassword({
          createNew: true,
          newPassword: password,
        })
          .then(res => {
            if (!res.status) {
              setErrors(res.errors);
            } else {
              onComplete();
              // TODO: complete
            }
          })
          .catch(e => {
            setErrors([e.message]);
          })
          .finally(() => {
            setIsBusy(false);
          });
      }
    }
  };

  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const _onChangePasswordValue = (currentValue: string) => {
    if (formState.data.repeatPassword) {
      onChangeValue('repeatPassword')('');
    }
    onChangeValue('password')(currentValue);
  };

  const isDisabled = useMemo(() => {
    return !checkValidateForm(formState.isValidated) || (errors && errors.length > 0) || isBusy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors, formState.isValidated.password, formState.isValidated.repeatPassword, isBusy]);

  return (
    <ContainerWithSubHeader
      showLeftBtn={true}
      onPressBack={() => navigation.goBack()}
      rightIcon={Info}
      title={'Create password'}
      style={{ width: '100%' }}>
      <View style={{ paddingHorizontal: theme.padding, flex: 1 }}>
        <Typography.Text
          style={{
            color: theme.colorTextLight4,
            fontSize: theme.fontSize,
            lineHeight: theme.fontSize * theme.lineHeight,
            ...FontSemiBold,
            textAlign: 'center',
            paddingTop: theme.padding,
            paddingBottom: theme.paddingLG,
          }}>
          Use this password to unlock your account.
        </Typography.Text>

        <PasswordField
          ref={formState.refs.password}
          label={formState.labels.password}
          defaultValue={formState.data.password}
          onChangeText={_onChangePasswordValue}
          errorMessages={formState.errors.password}
          onSubmitField={onSubmitField('password')}
        />

        <PasswordField
          ref={formState.refs.repeatPassword}
          label={formState.labels.repeatPassword}
          defaultValue={formState.data.repeatPassword}
          onChangeText={onChangeValue('repeatPassword')}
          errorMessages={formState.errors.repeatPassword}
          onSubmitField={onSubmitField('repeatPassword')}
        />

        <Warning message={'Recommended security practice'} title={'Always choose a strong password!'} />
      </View>

      <View style={footerAreaStyle}>
        <Button
          disabled={isDisabled}
          icon={
            <Icon
              phosphorIcon={CheckCircle}
              size={'lg'}
              iconColor={isDisabled ? theme.colorTextLight5 : theme.colorTextLight1}
            />
          }
          onPress={onSubmit}>
          {'Finish'}
        </Button>
      </View>
      <QrAddressScanner visible={isScanning} onHideModal={onHideModal} onSuccess={onScan} type={scanType} />
    </ContainerWithSubHeader>
  );
};

export default CreateMasterPassword;