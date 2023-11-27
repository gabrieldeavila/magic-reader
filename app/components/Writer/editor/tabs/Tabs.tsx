import React from "react";
import { TabsSt } from "./style";
import { X } from "react-feather";

function Tabs() {
  return (
    <TabsSt.Wrapper>
      <TabsSt.Content>
        <TabsSt.Option>
          <TabsSt.OptionName>Tabs.tsx</TabsSt.OptionName>
          <TabsSt.OptionClose>
            <X size={15} />
          </TabsSt.OptionClose>
        </TabsSt.Option>
        <TabsSt.Option active>
          <TabsSt.OptionName>brutus.tsx</TabsSt.OptionName>
          <TabsSt.OptionClose>
            <X size={15} />
          </TabsSt.OptionClose>
        </TabsSt.Option>
      </TabsSt.Content>
    </TabsSt.Wrapper>
  );
}

export default Tabs;
