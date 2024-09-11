import type { Meta, StoryObj } from "@storybook/react";

import { ProgressiveForm } from "./progressive-form";

const meta = {
  title: "ProgressiveForm",
} as Meta<typeof ProgressiveForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ProgressiveForm>
      <ProgressiveForm.Step stepKey="1">
        <label>이름</label>
        <input className="border" name="name" />
      </ProgressiveForm.Step>
      <ProgressiveForm.Step stepKey="2" depends={["name", "birthday"]}>
        <div>
          <label>전화번호</label>
          <input name="phone" />
          <label>집번호</label>
          <input name="home_phone" />
          <label>보호자 번호</label>
          <input />
        </div>
      </ProgressiveForm.Step>
      <ProgressiveForm.Step
        stepKey="3"
        depends={{
          name: "asd",
        }}
      >
        <label>생일</label>
        <input className="border" name="birthday" />
      </ProgressiveForm.Step>
    </ProgressiveForm>
  ),
};
