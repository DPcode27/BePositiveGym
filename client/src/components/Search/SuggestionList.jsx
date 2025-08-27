import React, { useEffect, useState } from "react";

const SuggestionList = ({
  suggestions,
  query,
  showSuggestions,
  setShowSuggestions,
}) => {
    useEffect(() => {
      if (query.length > 0) setShowSuggestions(true);
      else setShowSuggestions(false);
    }, [query]);
    

  function renderFilename(str) {
    const words = str.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {words.map((part, index) => {
          return part.toLowerCase() === query.toLowerCase() ? (
            <b key={index}>{part}</b>
          ) : (
            part
          );
        })}
      </span>
    );
  }

  return (
    <div className={`fixed z-10 bg-white p-3 ${!showSuggestions && "hidden"}`}>
      {suggestions.map((item) => {
        return (
          <div
            key={item.id}
            className="m-1 text-lg"
            onClick={() => alert("works")}
          >
            {renderFilename(item.filename)}
          </div>
        );
      })}
    </div>
  );
};

export default SuggestionList;
