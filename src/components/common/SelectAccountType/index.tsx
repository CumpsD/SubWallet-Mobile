import React, { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { EVM_ACCOUNT_TYPE, SUBSTRATE_ACCOUNT_TYPE } from 'constants/index';
import { KeypairType } from '@polkadot/util-crypto/types';
import { Logo, SelectItem } from '../../design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import SelectAccountTypeStyles from './style';

interface AccountTypeItem {
  label: string;
  key: KeypairType;
  icon: string;
  onClick: () => void;
}

interface SelectAccountTypeProps {
  selectedItems: KeypairType[];
  setSelectedItems: React.Dispatch<React.SetStateAction<KeypairType[]>>;
  title?: string;
}

export const SelectAccountType = (props: SelectAccountTypeProps) => {
  const { title, selectedItems, setSelectedItems } = props;
  const theme = useSubWalletTheme().swThemes;
  const _style = SelectAccountTypeStyles(theme);

  const onClickItem = useCallback(
    (key: KeypairType): (() => void) => {
      return () => {
        setSelectedItems(prevState => {
          const result = [...prevState];
          const exists = result.find(i => i === key);

          if (exists) {
            return result.filter(i => i !== key);
          } else {
            result.push(key);
            return result;
          }
        });
      };
    },
    [setSelectedItems],
  );
  const items = useMemo(
    (): AccountTypeItem[] => [
      {
        icon: 'polkadot',
        key: SUBSTRATE_ACCOUNT_TYPE,
        label: 'Substrate account',
        onClick: onClickItem(SUBSTRATE_ACCOUNT_TYPE),
      },
      {
        icon: 'ethereum',
        key: EVM_ACCOUNT_TYPE,
        label: 'Ethereum account',
        onClick: onClickItem(EVM_ACCOUNT_TYPE),
      },
    ],
    [onClickItem],
  );

  return (
    <View>
      {title && (
        <View>
          <Text style={_style.titleStyle}>{title}</Text>
        </View>
      )}
      {items.map(item => {
        const _selected = selectedItems.find(i => i === item.key);

        return (
          <SelectItem
            key={item.label}
            label={item.label}
            leftItemIcon={<Logo size={28} network={item.icon} shape={'circle'} />}
            isSelected={!!_selected}
            onPress={item.onClick}
            showUnselect={true}
          />
        );
      })}
    </View>
  );
};
