import React from "react";
import Chip from "@/elements/chip/Chip";
import { CoinBalanceModule } from "@/app/components/modules/coin-balance-module";

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
      <Chip
        icon={{
          name: "star-yellow",
          size: "medium",
        }}
        label={dataUser?.stars || "0"}
        theme={"white"}
        sx={{
          "& .MuiChip-label": {
            fontFamily: "'Advercase', serif !important",
            letterSpacing: "0.07rem",
          },
        }}
      />
    </>
  );
};

export default UserChips;
