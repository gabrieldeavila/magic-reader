import { X } from "react-feather";
import { stateStorage, useTriggerState } from "react-trigger-state";
import { TabsSt } from "./style";
import { useGTTranslate } from "@geavila/gt-design";
import { memo, useCallback, useMemo } from "react";

function Tabs() {
  const [currTabs] = useTriggerState({ name: "tabs", initial: [] });

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

  const isActive = useMemo(() => activeTab === id, [activeTab, id]);

  const handleClose = useCallback(() => {
    if (isActive) {
      stateStorage.set("active_tab", null);
    }

    const currTabs = stateStorage.get("tabs");

    stateStorage.set(
      "tabs",
      currTabs.filter((tab: any) => tab.id !== id)
    );
  }, [id, isActive]);

  return (
    <TabsSt.Option key={id} href={`${id}`} active={isActive}>
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
