import React, { useState } from "react";

const Item = ({ val, rowId }) => {
  return (
    <div
      className={`m-1 px-2 py-2 shadow-md w-full border border-transparent border-2 flex 
        justify-between min-w-xs w-[320px] h-[70px] overflow-auto
        bg-white`}
    >
      <div className={`flex flex-row "justify-start"`}>
        <h1
          className={`px-4 ${
            rowId === "row-0" ? "text-2xl font-bold" : "text-xl"
          }`}
        >
          {val}
        </h1>
      </div>
    </div>
  );
};

export default Item;
