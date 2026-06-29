import React from "react";
import Chip from "@/elements/chip/Chip";
import { CoinBalanceModule } from "@/app/components/modules/coin-balance-module";
import { StarBalanceModule } from "@/app/components/modules/star-balance-module";

const UserChips = ({ dataSummary, dataUser }) => {
  return (
    <>
      <CoinBalanceModule />
      {/* Fire chip is commented out in original code
      <Chip
        icon={{
          name: 'point-fire',
          size: 'medium'
        }}
        label={'0'}
        theme={'white'}
      /> */}
      <StarBalanceModule initialStars={dataUser?.stars} />
    </>
  );
};

export default UserChips;
