import { _ChainAsset } from '@subwallet/chain-list/types';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { YieldPoolInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { Avatar, Button, Icon, Number, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CaretDown, CaretUp } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { isAccountAll } from 'utils/accountAll';
import { toShort } from 'utils/index';
import createStyles from './styles';

type Props = {
  list: YieldPositionInfo[];
  poolInfo: YieldPoolInfo;
  inputAsset: _ChainAsset;
};

const EarningNominationInfo: React.FC<Props> = (props: Props) => {
  const { inputAsset, poolInfo, list } = props;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);

  const positionInfo = useMemo(() => list[0], [list]);
  const isAllAccount = useMemo(() => isAccountAll(positionInfo.address), [positionInfo.address]);

  const [showDetail, setShowDetail] = useState(false);

  const haveNomination = useMemo(() => {
    return [YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING].includes(poolInfo.type);
  }, [poolInfo.type]);

  const isRelayChain = useMemo(() => _STAKING_CHAIN_GROUP.relay.includes(poolInfo.chain), [poolInfo.chain]);

  const toggleDetail = useCallback(() => {
    setShowDetail(old => !old);
  }, []);

  if (!haveNomination || isAllAccount) {
    return null;
  }

  return (
    <>
      <View style={styles.header}>
        <Typography.Text style={styles.headerText}>Nomination info</Typography.Text>
        <Button
          type="ghost"
          size="xs"
          icon={<Icon phosphorIcon={showDetail ? CaretUp : CaretDown} size="sm" iconColor={theme['gray-5']} />}
          onPress={toggleDetail}
        />
      </View>
      {showDetail && (
        <MetaInfo style={styles.infoContainer}>
          {positionInfo.nominations.map(item => {
            return (
              <View style={styles.infoRow} key={item.validatorAddress}>
                <View style={styles.accountRow}>
                  <Avatar value={item.validatorAddress} size={theme.sizeLG} />
                  <Typography.Text style={styles.accountText} ellipsis={true} numberOfLines={1}>
                    {item.validatorIdentity || toShort(item.validatorAddress)}
                  </Typography.Text>
                </View>
                {!isRelayChain && (
                  <Number
                    size={theme.fontSizeHeading6}
                    textStyle={styles.infoText}
                    value={item.activeStake}
                    decimal={inputAsset?.decimals || 0}
                    suffix={inputAsset?.symbol}
                  />
                )}
              </View>
            );
          })}
        </MetaInfo>
      )}
    </>
  );
};

export default EarningNominationInfo;