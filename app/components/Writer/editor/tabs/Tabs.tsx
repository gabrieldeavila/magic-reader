import { useGTTranslate } from "@geavila/gt-design";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { X } from "react-feather";
import { stateStorage, useTriggerState } from "react-trigger-state";
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

  return (
    <TabsSt.Wrapper>
      <TabsSt.Content>
        {currTabs.map(({ id, name }) => (
          <Tab key={id} id={id} name={name} />
        ))}
      </TabsSt.Content>
    </TabsSt.Wrapper>
  );
}

export default Tabs;

const Tab = memo(({ id, name }: { id: string; name: string }) => {
  const [activeTab] = useTriggerState({ name: "active_tab" });
  const { translateThis } = useGTTranslate();
  const [lang] = useTriggerState({ name: "lang" });

  const isActive = useMemo(() => activeTab === id, [activeTab, id]);

  const router = useRouter();

  const handleClose = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();

      if (isActive) {
        stateStorage.set("active_tab", null);
      }

      const currTabs = stateStorage.get("tabs");
      const newTabs = currTabs.filter((tab: any) => tab.id !== id);

      stateStorage.set("tabs", newTabs);

      if (isActive && newTabs.length === 0) {
        router.push(`/${lang}/scribere`);
      } else {
        const newActiveTab = newTabs[newTabs.length - 1];
        router.push(`/${lang}/scribere/${newActiveTab.id}`);
      }
    },
    [id, isActive, lang, router]
  );

  const handleDrop = useCallback(
    (ev) => {
      const tabId = parseInt(ev.dataTransfer.getData("text/plain"));

      const currTabs = stateStorage.get("tabs");
      const tabDragged = currTabs.find((tab: any) => tab.id === tabId);
      const prevTabIndex = currTabs.findIndex((tab: any) => tab.id === id);

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
        {name || translateThis("LEGERE.UNTITLED")}
      </TabsSt.OptionName>
      <TabsSt.OptionClose onClick={handleClose}>
        <X size={15} />
      </TabsSt.OptionClose>
    </TabsSt.Option>
  );
});

Tab.displayName = "Tab";
