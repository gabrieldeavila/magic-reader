import { X } from "react-feather";
import { useTriggerState } from "react-trigger-state";
import { TabsSt } from "./style";

function Tabs() {
  const [currTabs] = useTriggerState({ name: "tabs", initial: [] });
  const [activeTab] = useTriggerState({ name: "active_tab" });

  return (
    <TabsSt.Wrapper>
      <TabsSt.Content>
        {currTabs.map(({ id, name }) => (
          <TabsSt.Option key={id} active={activeTab === id}>
            <TabsSt.OptionName title={name}>{name}</TabsSt.OptionName>
            <TabsSt.OptionClose>
              <X size={15} />
            </TabsSt.OptionClose>
          </TabsSt.Option>
        ))}
      </TabsSt.Content>
    </TabsSt.Wrapper>
  );
}

export default Tabs;
