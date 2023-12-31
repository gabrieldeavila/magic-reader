import { useGTTranslate } from "@geavila/gt-design";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "react-feather";
import {
  globalState,
  stateStorage,
  useTriggerState,
} from "react-trigger-state";
import useUpdateTabs from "../../hooks/crud/useUpdateTabs";
import { TabsSt } from "./style";

function Tabs() {
  const [currTabs] = useTriggerState({
    name: "tabs",
    initial: localStorage.getItem("tabs")
      ? JSON.parse(localStorage.getItem("tabs")!)
      : [],
  });

  useEffect(() => {
    localStorage.setItem("tabs", JSON.stringify(currTabs));
  }, [currTabs]);

  const onRef = useCallback((node: HTMLDivElement) => {
    globalState.set("tabs_ref", node);
  }, []);

  return (
    <TabsSt.Wrapper>
      <TabsSt.Content ref={onRef}>
        {currTabs.map(({ id, name, emoji }) => (
          <Tab key={id} id={id} name={name} emoji={emoji} />
        ))}
      </TabsSt.Content>
    </TabsSt.Wrapper>
  );
}

export default Tabs;

const Tab = memo(
  ({ id, name, emoji }: { id: string; name: string; emoji: string }) => {
    const [activeTab] = useTriggerState({ name: "active_tab" });
    const { translateThis } = useGTTranslate();
    const [lang] = useTriggerState({ name: "lang" });
    const tabRef = useRef(null);
    const isActive = useMemo(() => activeTab === id, [activeTab, id]);
    const updateTabs = useUpdateTabs();

    const handleClose = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        updateTabs({
          isActive,
          id,
        });
      },
      [id, isActive, updateTabs]
    );

    useEffect(() => {
      if (!isActive) return;

      tabRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });

      const tabsRef = globalState.get("writter_ref");

      // when change the height of the tabs, scroll to the active tab
      const observer = new MutationObserver(() => {
        tabRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      });

      observer.observe(tabsRef, {
        attributes: true,
        childList: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
      };
    }, [isActive]);

    const handleDrop = useCallback(
      (ev) => {
        const tabId = parseInt(ev.dataTransfer.getData("text/plain"));

        if (isNaN(tabId)) return;

        const currTabs = stateStorage.get("tabs");
        const prevTabIndex = currTabs.findIndex((tab: any) => tab.id === id);

        const tabDragged = currTabs.find((tab: any) => tab.id === tabId);

        if (!tabDragged) return;

        const newTabs = currTabs.filter((tab: any) => tab.id !== tabId);

        let index = newTabs.findIndex((tab: any) => tab.id === id) + 1;

        if (prevTabIndex < index) {
          index--;
        } else if (prevTabIndex > index) {
          index++;
        }

        newTabs.splice(index, 0, tabDragged);

        stateStorage.set("tabs", newTabs);
      },
      [id]
    );

    const [isDraggingOver, setIsDraggingOver] = useState(false);

    return (
      <TabsSt.Option
        ref={tabRef}
        isDraggingOver={isDraggingOver}
        draggable
        onDragStart={(ev) => {
          ev.dataTransfer.setData("text/plain", id);
        }}
        onDragOver={(ev) => {
          ev.preventDefault();
          setIsDraggingOver(true);
        }}
        onDrop={(ev) => {
          ev.preventDefault();
          handleDrop(ev);
          setIsDraggingOver(false);
        }}
        // remove isDraggingOver class when mouse leaves the tab
        onDragLeave={() => setIsDraggingOver(false)}
        // add data to drag to be able to move the tab
        data-id={id}
        key={id}
        href={`/${lang}/scribere/${id}`}
        active={isActive}
      >
        <TabsSt.OptionName title={name || translateThis("LEGERE.UNTITLED")}>
          {emoji} {name || translateThis("LEGERE.UNTITLED")}
        </TabsSt.OptionName>
        <TabsSt.OptionClose onClick={handleClose}>
          <X size={15} />
        </TabsSt.OptionClose>
      </TabsSt.Option>
    );
  }
);

Tab.displayName = "Tab";
