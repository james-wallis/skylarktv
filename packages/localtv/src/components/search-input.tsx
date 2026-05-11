import clsx from "clsx";
import { useState } from "react";
import { MdSearch, MdClear } from "react-icons/md";

// Visual-only for Phase 1. Phase 2 will wire this up against the local
// library catalog. Mirrors SkylarkTV's <Search> styling.
export const SearchInput = () => {
  const [value, setValue] = useState("");

  return (
    <div
      className={clsx(
        "flex items-center justify-center rounded-full border-0 border-gray-300 bg-skylarktv-purple-500/80 p-3 px-4 transition-colors focus-within:border-white focus-within:text-white md:bg-button-tertiary",
        value ? "text-white" : "text-gray-300",
      )}
    >
      <input
        className="w-full border-none bg-transparent px-2 py-0 shadow-none outline-none ring-0 placeholder:text-gray-300 focus:border-none focus:shadow-none focus:outline-none focus:ring-0 focus:placeholder:text-white md:w-44"
        placeholder="Search"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value ? (
        <button className="text-2xl" type="button" onClick={() => setValue("")}>
          <MdClear />
        </button>
      ) : (
        <MdSearch className="text-2xl" />
      )}
    </div>
  );
};
