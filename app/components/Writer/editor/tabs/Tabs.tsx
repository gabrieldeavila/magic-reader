import { X } from "react-feather";
import { stateStorage, useTriggerState } from "react-trigger-state";
import { TabsSt } from "./style";
import { useGTTranslate } from "@geavila/gt-design";
import { memo, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

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

  return (
    <TabsSt.Option key={id} href={`/${lang}/scribere/${id}`} active={isActive}>
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
