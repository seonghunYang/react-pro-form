import type { Meta, StoryObj } from "@storybook/react";

import { ProgressiveForm } from "../src/progressive-form";

const meta = {
  title: "ProgressiveForm",
} as Meta<typeof ProgressiveForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ProgressiveForm>
      <ProgressiveForm.Step>
        <label>이름</label>
        <input name="name" />
      </ProgressiveForm.Step>
      <ProgressiveForm.Step depends={["name", "birthday"]}>
        <label>전화번호</label>
        <input name="phone" />
      </ProgressiveForm.Step>
      <ProgressiveForm.Step
        depends={{
          name: "홍길동",
        }}
      >
        <label>생일</label>
        <input name="birthday" />
      </ProgressiveForm.Step>
    </ProgressiveForm>
  ),
};
