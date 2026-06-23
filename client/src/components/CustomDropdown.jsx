import { Fragment } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

const CustomDropdown = ({
  value,
  onChange,
  options,
  placeholder = "Seçiniz...",
  icon: Icon,
  className = "",
  disabled = false,
}) => {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={`relative ${className}`}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <ListboxButton className="relative w-full pl-10 pr-4 py-1.5 bg-input border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer hover:bg-accent transition-colors text-left">
            {Icon && (
              <Icon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
            <span className="block truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDownIcon
                className="h-4 w-4 text-muted-foreground"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </span>
          </ListboxButton>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover border border-border shadow-md focus:outline-none text-sm p-1">
              {options.map((option) => (
                <ListboxOption
                  key={option.value}
                  className={({ active, selected }) =>
                    `relative cursor-pointer select-none py-1.5 pl-3 pr-9 rounded-sm transition-colors ${
                      active
                        ? "bg-accent text-accent-foreground"
                        : selected
                          ? "bg-accent/60 text-popover-foreground"
                          : "text-popover-foreground hover:bg-accent/60"
                    }`
                  }
                  value={option.value}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {option.label}
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
    </div>
  );
};

export default CustomDropdown;
