import React from 'react';

import HistoryDetailAmount from './Amount';
import HistoryDetailFee from './Fee';
import HistoryDetailHeader from './Header';
import MetaInfo from 'components/MetaInfo';
import { HistoryStatusMap, TxTypeNameMap } from '../../shared';
import { TransactionHistoryDisplayItem } from 'types/history';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import { customFormatDate } from 'utils/customFormatDate';
import { IconProps } from 'phosphor-react-native';

interface Props {
  data: TransactionHistoryDisplayItem;
}

const HistoryDetailLayout: React.FC<Props> = (props: Props) => {
  const { data } = props;

  return (
    <MetaInfo>
      <MetaInfo.DisplayType label={i18n.historyScreen.label.transactionType} typeName={TxTypeNameMap[data.type]} />
      <HistoryDetailHeader data={data} />
      <MetaInfo.Status
        label={i18n.historyScreen.label.transactionStatus}
        statusIcon={HistoryStatusMap[data.status].icon as React.ElementType<IconProps>}
        statusName={HistoryStatusMap[data.status].name}
        valueColorSchema={HistoryStatusMap[data.status].schema}
      />
      <MetaInfo.Default label={i18n.historyScreen.label.extrinsicHash}>
        {toShort(data.extrinsicHash, 8, 9)}
      </MetaInfo.Default>
      <MetaInfo.Default label={i18n.historyScreen.label.transactionTime}>
        {customFormatDate(data.time, '#hhhh#:#mm# - #MMM# #DD#, #YYYY#')}
      </MetaInfo.Default>
      <HistoryDetailAmount data={data} />
      <HistoryDetailFee data={data} />
    </MetaInfo>
  );
};

export default HistoryDetailLayout;
