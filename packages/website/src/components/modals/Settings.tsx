import type { Component, Setter } from "solid-js";
import { Dialog, Select } from "@kobalte/core";

import MdiClose from '~icons/mdi/close'
import MdiCheck from '~icons/mdi/check'
import MdiChevronDown from '~icons/mdi/chevron-down'

import { DEFAULT_USER_CUSTOMIZATION, preferences, setMainGroup, setSubGroup, setUserCustomization, setYear } from "~/stores/preferences";
import { resetAppCache } from "~/stores/timetables";

const SelectionButton: Component<{
  active: boolean,
  onClick: () => void,
  content: string
}> = (props) => (
  <button type="button"
    class="w-full text-center rounded-lg px-4 py-1"
    onClick={() => props.onClick()}
    classList={{
      "text-[rgb(120,120,120)] bg-[rgb(50,50,50)]": !props.active,
      "text-[rgb(240,240,240)] bg-red font-medium": props.active,
    }}
  >
    {props.content}
  </button>
);

export const SettingsModal: Component<{ open: boolean, setOpen: Setter<boolean> }> = (props) => {
  const userPrimaryColor = () => preferences.customization.primary_color ?? DEFAULT_USER_CUSTOMIZATION.primary_color;

  return (
    <Dialog.Root open={props.open} onOpenChange={(open) => props.setOpen(open)} modal={true}>
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 z-50 bg-[rgba(21,21,21,.6)] backdrop-blur-md" />

        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto">
          <Dialog.Content class="bg-[rgb(32,32,32)] rounded-lg max-w-[450px] w-full my-auto">
            <div class="relative flex item justify-between items-center mb-2 border-b border-b-[rgb(90,90,90)] p-4 text-[rgb(220,220,220)]">
              <Dialog.Title class="text-[20px] font-medium">
                Paramètres
              </Dialog.Title>
              <Dialog.CloseButton class="flex items-center justify-center p-1">
                <MdiClose class="text-lg a" />
              </Dialog.CloseButton>
            </div>

            <div class="p-4 flex flex-col gap-6">
              <section class="flex flex-col gap-2">
                <h2 class="text-[rgb(240,240,240)] text-[18px]">
                  Année
                </h2>
                <div class="flex gap-2">
                  <SelectionButton
                    content="A1"
                    active={preferences.year === 1}
                    onClick={() => setYear(1)}
                  />
                  <SelectionButton
                    content="A2"
                    active={preferences.year === 2}
                    onClick={() => setYear(2)}
                  />
                  <SelectionButton
                    content="A3"
                    active={preferences.year === 3}
                    onClick={() => setYear(3)}
                  />
                </div>
              </section>

              <section>
                <h3 class="text-[rgb(240,240,240)] text-[18px] mb-2">
                  Groupe principal
                </h3>
                <div class="flex">
                  <button type="button"
                    disabled={preferences.main_group <= 1}
                    class="text-center border-2 border-red text-[rgb(220,220,220)] disabled:(bg-red text-transparent) px-4 py-1 border-r-none rounded-l-lg"
                    onClick={() => {
                      const value = preferences.main_group - 1;
                      if (value < 1) return;
                      setMainGroup(value)
                    }}
                  >
                    -1
                  </button>
                  <div
                    aria-label="Groupe principal"
                    class="w-full text-center text-rgb(240,240,240)] bg-red px-3 py-1 font-medium text-lg"
                  >
                    G{preferences.main_group}
                  </div>
                  <button type="button"
                    disabled={preferences.main_group >= 8}
                    class="text-center border-2 border-red text-[rgb(220,220,220)] disabled:(bg-red text-transparent) px-4 py-1 border-l-none rounded-r-lg"
                    onClick={() => {
                      const value = preferences.main_group + 1;
                      if (value > 8) return;
                      setMainGroup(value);
                    }}
                  >
                    +1
                  </button>
                </div>

                <p class="text-[rgb(190,190,190)] text-xs mt-1.5">
                  Ajustez le groupe dans lequel vous êtes (ex.: G1, G2, …)
                </p>
              </section>

              <section>
                <h3 class="text-[rgb(240,240,240)] text-[18px] mb-2">
                  Sous-groupe
                </h3>

                <div class="flex gap-2">
                  <SelectionButton
                    content="A"
                    active={preferences.sub_group === 0}
                    onClick={() => setSubGroup(0)}
                  />
                  <SelectionButton
                    content="B"
                    active={preferences.sub_group === 1}
                    onClick={() => setSubGroup(1)}
                  />
                </div>

                <p class="text-[rgb(190,190,190)] text-xs mt-1.5">
                  Ajustez le sous-groupe dans lequel vous êtes (ex.: G{preferences.main_group}A ou G{preferences.main_group}B)
                </p>
              </section>

              <section>
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-[rgb(240,240,240)] text-[18px] flex">
                    Couleur de l'interface
                  </h3>
                  <div
                    class="w-4 h-4 rounded-full"
                    style={{ "background-color": `rgb(${userPrimaryColor()})` }}
                  ></div>
                </div>
                <input
                  type="text"
                  class="px-3 py-1 w-full rounded-lg outline-none focus:outline-red"
                  value={userPrimaryColor()}
                  onInput={(e) => {
                    setUserCustomization({
                      ...preferences.customization,
                      primary_color: e.currentTarget.value,
                    });
                  }}
                />
                <p class="text-[rgb(190,190,190)] text-xs mt-1.5">
                  Attention : la couleur doit être définie dans le format "r,g,b".
                </p>
              </section>
            </div>

            <div class="h-[1px] w-full border-b border-b-[rgb(90,90,90)]" />

            <section class="p-4">
              <h3 class="text-[rgb(240,240,240)] text-[18px] mb-3">
                Zone dangeureuse
              </h3>

              <button class="w-full text-center border border-red text-red px-3 py-1 rounded-lg"
                type="button"
                onClick={() => resetAppCache()}
              >
                Effacer les données
              </button>
              <p class="text-[rgb(190,190,190)] text-xs mt-1.5">
                Supprime les données stockées par l'application dans le navigateur.
              </p>
            </section>

          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}