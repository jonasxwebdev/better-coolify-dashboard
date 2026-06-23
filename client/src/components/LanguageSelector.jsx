import { Fragment } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { SOUND_TYPES } from "../utils/soundUtils";

const LANGUAGES = [
  { code: "en", flag: "/EN.svg", label: "English" },
  { code: "de", flag: "/DE.svg", label: "Deutsch" },
  { code: "tr", flag: "/TR.svg", label: "Türkçe" },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { playSound } = useSoundEffects();

  const current =
    LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0];

  const changeLanguage = (code) => {
    if (code === i18n.language) return;
    playSound(SOUND_TYPES.CLICK);
    i18n.changeLanguage(code);
    localStorage.setItem("language", code);
  };

  return (
    <Listbox value={current.code} onChange={changeLanguage}>
      <div className="relative">
        <ListboxButton className="inline-flex items-center gap-1.5 h-9 pl-2.5 pr-2 rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-accent transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium touch-manipulation">
          <img
            src={current.flag}
            alt=""
            className="w-4 h-4 object-contain rounded-[2px]"
          />
          <span>{current.code.toUpperCase()}</span>
          <ChevronDownIcon
            className="w-4 h-4 text-muted-foreground"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </ListboxButton>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions className="absolute right-0 z-10 mt-1 min-w-[9rem] overflow-auto rounded-md bg-popover border border-border shadow-md focus:outline-none text-sm p-1">
            {LANGUAGES.map((lang) => (
              <ListboxOption
                key={lang.code}
                value={lang.code}
                className={({ active, selected }) =>
                  `relative flex items-center gap-2 cursor-pointer select-none py-1.5 pl-3 pr-9 rounded-sm transition-colors ${
                    active
                      ? "bg-accent text-accent-foreground"
                      : selected
                        ? "bg-accent/60 text-popover-foreground"
                        : "text-popover-foreground hover:bg-accent/60"
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <img
                      src={lang.flag}
                      alt=""
                      className="w-4 h-4 object-contain rounded-[2px]"
                    />
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {lang.label}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary">
                        <CheckIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </div>
    </Listbox>
  );
};

export default LanguageSelector;
