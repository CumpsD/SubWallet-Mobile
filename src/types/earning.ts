import { _ChainAsset } from '@subwallet/chain-list/types';
import { AbstractYieldPositionInfo } from '@subwallet/extension-base/types';
import { SWIconProps } from 'components/design-system-ui/icon';
import { BalanceValueInfo } from 'types/balance';
import { PhosphorIcon } from 'utils/campaign';

export interface ExtraYieldPositionInfo extends AbstractYieldPositionInfo {
  asset: _ChainAsset;
  price: number;
  exchangeRate: number;
}

export interface YieldGroupInfo {
  maxApy?: number;
  group: string;
  symbol: string;
  token: string;
  balance: BalanceValueInfo;
  isTestnet: boolean;
  name?: string;
}

export interface EarningTagType {
  label: string;
  icon: PhosphorIcon;
  bgColor: string;
  color: string;
  weight: SWIconProps['weight'];
}